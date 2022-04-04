import { Transform } from "node:stream";

const SIZE_WITE_BUF = 1000;

export class LogFilter extends Transform {
  constructor(opt = {}) {
    super({ ...opt, readableObjectMode: true, writableObjectMode: false });
    this.buf = null;
    this.witeBuf = null; //Buffer.from(""); //Buffer.alloc(200)
  }
  /**
   * метод, реализующий в себе запись данных (chunk поступают в поток Transform),
   * и чтение данных - когда другой поток читает из Transform
   * @param chunk
   * @param encoding
   * @param done - в общем случае done(err, chunk)
   * @private
   */
  _transform(data, enc, done) {
    // console.log(this.witeBuf?.toString('utf8'), this.witeBuf?.length);
    if (data.length < SIZE_WITE_BUF) {
      if (!this.witeBuf) this.witeBuf = data;
      else this.witeBuf = Buffer.concat([this.witeBuf, data]);
      if (this.witeBuf.length < SIZE_WITE_BUF) return done();
    }

    let inputString;
    if (this.witeBuf) {
      inputString = this.witeBuf.toString("utf8");
      this.witeBuf = null;
    } else {
      inputString = data.toString("utf8");
    }
    // console.log(inputString);
    // const inputString = data.toString("utf8");

    const LENGTH_HEAD = 183;
    const regexpStart = /^-{60}\n-{5}\s{18}STATISTIC\s{23}-{5}\n-{60}$/gm;
    const regexpEnd = /Exporting stat\.{3}\s\[done\]/gm;

    const idxStarts = [...inputString.matchAll(regexpStart)].map(
      (i) => i.index + LENGTH_HEAD
    );
    const idxEnds = [...inputString.matchAll(regexpEnd)].map(
      (i) => i.index - 1
    );

    if (idxStarts.length === 0 && idxEnds.length === 0 && this.buf) {
      this.buf += inputString;
    }

    // console.log(idxStarts.length, idxEnds.length);
    if (idxStarts[0] > idxEnds[0]) idxStarts.unshift(undefined);

    for (let i = 0; i < Math.max(idxStarts.length, idxEnds.length); i++) {
      let stat = inputString.slice(idxStarts[i], idxEnds[i]);

      if (idxStarts[i] && !idxEnds[i]) {
        this.buf = stat;
        continue;
      } else if (!idxStarts[i] && idxEnds[i]) {
        stat = this.buf + stat;
        // stat += this.buf;

        this.buf = null;
      }
      this.push(new String(stat));
    }
    done();
  }
}

export class FmParser extends Transform {
  constructor(opt = {}) {
    super({ ...opt, readableObjectMode: true, writableObjectMode: true });
  }
  _transform(data, enc, done) {
    // console.log('data', data);
    let error = null;
    let stat;
    try {
      stat = parseData(data);
      if (!stat) error = new Error("parser error");
    } catch (err) {
      error = err;
    }
    done(error, stat);
  }
}

const parseData = (data) => {
  const pred = /^\*{3}/gm;

  const idxStarts = [...data.matchAll(pred)].map((i) => i.index);

  if (idxStarts.length % 2 !== 0) idxStarts.push(undefined);

  const stat = {
    boards: [],
    master: {
      intervals: [],
      date: null,
      uptime: 0,
      diff: 0,
      foundBoards: 0,
      brokenSPI: 0,
      safeStart: 0,
      server: {
        u: 0,
        i: 0,
        w: 0,
        "w/GHz": 0,
      },
    },
    pool: {
      intervals: [],
      user: "",
      diff: "",
      extraNonce1: "",
      extraNonce2Size: "",
      jobs: "",
    },
    event: {
      intervals: [],
    },
    system: {
      psu: "",
      fan: "",
      fanRPM: {
        min: "",
        avr: "",
        max: "",
        rpms: [],
      },
      temp: {
        cold: "",
        min: "",
        avr: "",
        max: "",
      },
    },
    spi: {
      broadcasts: "",
      totalPackets: "",
      speed: "",
      staus: [],
    },
  };
  for (let i = 0; i < idxStarts.length - 1; i += 1) {
    const block = data.slice(idxStarts[i], idxStarts[i + 1]).split("\n");

    if (block[0].includes("BOARDS")) {
      if (block[0].includes("SYS INFO")) {
        const [, , ...table] = block.filter((s) => !/^$/.test(s));
        table.forEach((row) => {
          stat.boards.push({
            id: row.slice(0, 3).trim(),
            found: row.slice(3, 10).trim(),
            rev: row.slice(10, 19).trim(),
            spi: row.slice(19, 25).trim(),
            pwr: row.slice(25, 32).trim(),
            chips: row.slice(32, 39).trim(),
            oh: row.slice(39, 43).trim(),
            t: row.slice(43, 48).trim(),
            revADC: row.slice(48, 56).trim(),
            i_SYS: row.slice(56).trim(),
          });
        });
      } else if (block[0].includes("I/OSC INFO")) {
        const [, , ...table] = block.filter((s) => !/^$/.test(s));
        table.forEach((row) => {
          const bid = row.slice(0, 3).trim();
          const board = stat.boards.find((b) => b.id === bid);
          if (board) {
            board.i_OSC = row.slice(3, 10).trim();
            board.trg = row.slice(10, 15).trim();
            board.dOSC = row.slice(15).trim();
          }
        });
      } else if (block[0].includes("RFID DATA")) {
        const [, , ...table] = block.filter((s) => !/^$/.test(s));
        table.forEach((row) => {
          const bid = row.slice(0, 3).trim();
          const board = stat.boards.find((b) => b.id === bid);
          if (board) {
            board.uid = row.slice(3, 25).trim();
            board.tag = row.slice(25).trim();
          }
        });
      } else if (block[0].includes("STAT DELTA")) {
        const [blockName, , ...table] = block.filter((s) => !/^$/.test(s));
        stat.deltaTime = blockName.slice(23, 25);
        stat.boards_count = blockName.slice(32, 34);
        stat.chips_count = blockName.slice(43, 47);
        table.forEach((row) => {
          const bid = row.slice(0, 3).trim();
          const board = stat.boards.find((b) => b.id === bid);
          if (board) {
            board.delta = {
              sol: row.slice(3, 8).trim(),
              err: row.slice(8, 13).trim(),
              bySol: row.slice(13, 21).trim(),
              ["e/s"]: row.slice(21, 26).trim(),
              jobs: row.slice(26, 32).trim(),
              cr: row.slice(32, 36).trim(),
              ["w/GHz"]: row.slice(36, 43).trim(),
              epwc: row.slice(43).trim(),
            };
          }
        });
      } else if (block[0].includes("STAT TOTAL")) {
        const [blockName, , ...table] = block.filter((s) => !/^$/.test(s));
        stat.totalTime = blockName.slice(23, 26);
        table.forEach((row) => {
          const bid = row.slice(0, 3).trim();
          const board = stat.boards.find((b) => b.id === bid);
          if (board) {
            board.total = {
              sol: row.slice(3, 8).trim(),
              err: row.slice(8, 13).trim(),
              bySol: row.slice(13, 21).trim(),
              ["e/s"]: row.slice(21, 26).trim(),
              jobs: row.slice(26, 32).trim(),
              cr: row.slice(32, 36).trim(),
              ["w/GHz"]: row.slice(36, 43).trim(),
              epwc: row.slice(43).trim(),
            };
          }
        });
      }
    } else if (block[0].includes("MASTER ")) {
      if (block[0].includes("STATS PER INTERVAL")) {
        const [, , ...table] = block.filter((s) => !/^$/.test(s));
        table.forEach((row) => {
          stat.master.intervals.push({
            interval: row.slice(0, 8).trim(),
            sec: row.slice(8, 14).trim(),
            bySol: row.slice(14, 21).trim(),
            byDiff: row.slice(21, 29).trim(),
            byPool: row.slice(29, 37).trim(),
            byJobs: row.slice(37, 45).trim(),
            chipsAVG: row.slice(45, 55).trim(),
            sol: row.slice(55, 60).trim(),
            err: row.slice(60, 65).trim(),
            errPercent: row.slice(65, 73).trim(),
            cr: row.slice(73).trim(),
          });
        });
      } else if (block[0].includes("STATS")) {
        const [, ...dataRow] = block.filter((s) => !/^$/.test(s));
        let regexpDate =
          /Date:\s(?<day>\d{2}).(?<month>\d{2}).(?<year>\d{2})\s(?<hour>\d{2}):(?<min>\d{2}):(?<sec>\d{2}),\sUpTime:\s(?<uptime>\d*)\ssecs,\sDiff:\s(?<diff>\d*)/;

        let groups = dataRow[0].match(regexpDate)?.groups;
        stat.master.date = new Date(
          parseInt("20" + groups.year),
          parseInt(groups.month) - 1,
          parseInt(groups.day),
          parseInt(groups.hour),
          parseInt(groups.min),
          parseInt(groups.sec)
        );
        stat.master.uptime = parseInt(groups.uptime);
        stat.master.diff = groups.diff;

        regexpDate = /Found boards:\s+(?<foundBoards>\d+)/;
        groups = dataRow[1].match(regexpDate)?.groups;
        stat.master.foundBoards = parseInt(groups?.foundBoards);

        regexpDate = /Broken SPI:\s+(?<brokenSPI>\d+)/;
        groups = dataRow[2].match(regexpDate)?.groups;
        stat.master.brokenSPI = parseInt(groups?.brokenSPI);

        regexpDate = /Safe Start:\s+(?<safeStart>\d+)/;
        groups = dataRow[3].match(regexpDate)?.groups;
        stat.master.safeStart = parseInt(groups?.safeStart);

        regexpDate = /Server U:\s+(?<server_u>\d*\.?\d+)/;
        groups = dataRow[4].match(regexpDate)?.groups;
        stat.master.server.u = parseFloat(groups?.server_u);

        regexpDate = /Server I:\s+(?<server_i>\d*\.?\d+)/;
        groups = dataRow[5].match(regexpDate)?.groups;
        stat.master.server.i = parseFloat(groups?.server_i);

        regexpDate = /Server W:\s+(?<server_w>\d*\.?\d+)/;
        groups = dataRow[6].match(regexpDate)?.groups;
        stat.master.server.w = parseFloat(groups?.server_w);

        regexpDate = /Server W\/GHs:\s+(?<server_wGHz>\d*\.?\d+)/;
        groups = dataRow[7].match(regexpDate)?.groups;
        stat.master.server["w/GHz"] = parseFloat(groups?.server_wGHz);
      }
    } else if (block[0].includes("POOL STATS")) {
      const tablrIdx = block.findIndex((row) => row.includes("INTERVAL"));

      const regexpInfo = /([^,\s\n]+):\s([^,\n]+)/g;
      const info = block.slice(1, tablrIdx).join("\n").replace("Pool: ", "");
      const infoEntris = [...info.matchAll(regexpInfo)].map((i) => [
        i[1],
        i[2],
      ]);
      Object.assign(stat.pool, Object.fromEntries(infoEntris));

      const table = block.slice(tablrIdx + 1).filter((s) => !/^$/.test(s));
      table.forEach((row) => {
        stat.pool.intervals.push({
          interval: row.slice(0, 8).trim(),
          sec: row.slice(8, 14).trim(),
          jobs: row.slice(14, 20).trim(),
          clean: row.slice(20, 27).trim(),
          shares: row.slice(27, 35).trim(),
          ok: row.slice(35, 39).trim(),
          err: row.slice(39, 44).trim(),
          poolSol: row.slice(44, 54).trim(),
          loss: row.slice(54, 60).trim(),
          inservice: row.slice(60, 71).trim(),
          percents: row.slice(71).trim(),
        });
      });
    } else if (block[0].includes("EVENT STATS")) {
      const tablrIdx = block.findIndex((row) => row.includes("INTERVAL"));
      const table = block.slice(tablrIdx + 1).filter((s) => !/^$/.test(s));
      table.forEach((row) => {
        stat.event.intervals.push({
          interval: row.slice(0, 8).trim(),
          sec: row.slice(8, 14).trim(),
          oh: row.slice(14, 18).trim(),
          diff: row.slice(18, 24).trim(),
          rec: row.slice(24, 29).trim(),
          rece: row.slice(29, 35).trim(),
          shares: row.slice(35, 43).trim(),
          pss: row.slice(43, 48).trim(),
          psd: row.slice(48, 53).trim(),
          djs: row.slice(53, 58).trim(),
          sjs: row.slice(58, 63).trim(),
          dup: row.slice(63, 68).trim(),
          lds: row.slice(68, 73).trim(),
          bds: row.slice(73, 78).trim(),
          bts: row.slice(78).trim(),
        });
      });
    } else if (block[0].includes("SYSTEM STATS")) {
      const tablrIdx = block.findIndex((row) => row.includes("INTERVAL"));

      let regexpEntrys = /([^,\s\n]+):\s([^,\n]+)/g;
      let entris = [...block[1].matchAll(regexpEntrys)].map((i) => [
        i[1].toLowerCase(),
        i[2],
      ]);
      Object.assign(stat.system, Object.fromEntries(entris));

      regexpEntrys = /\s*(?<key>\d)\s*/g;
      entris = [...block[3].matchAll(regexpEntrys)].map((i) => parseInt(i[1]));
      stat.system.fanRPM.rpms = entris;

      regexpEntrys =
        /FAN RPM \(min\/avr\/max\):\s*(?<min>\d*)\s*\/\s*(?<avr>\d*)\s*\/\s*(?<max>\d*)/;
      let groups = block[4].match(regexpEntrys)?.groups;
      Object.assign(stat.system.fanRPM, groups);

      regexpEntrys =
        /Temp\(C\) \(cold\/min\/avr\/max\):\s*(?<cold>\d*)\s*\/\s*(?<min>\d*)\s*\/\s*(?<avr>\d*)\s*\/\s*(?<max>\d*)/;
      groups = block[5].match(regexpEntrys)?.groups;
      Object.assign(stat.system.temp, groups);
    } else if (block[0].includes("MASTER-SLAVE SPI BUS STATS")) {
      const tableEndIdx = block.findIndex((row) =>
        row.includes("SPI Broadcasts")
      );
      stat.spi.broadcasts = block[block.length - 2].slice(15).trim();

      let regexpEntrys =
        /Total packets: (?<totalPackets>\d+), speed: (?<speed>\d*\.?\d+) packets\/sec/;
      let entris = block[block.length - 1].match(regexpEntrys)?.groups;
      Object.assign(stat.spi, entris);

      const table = block.slice(2, tableEndIdx).filter((s) => !/^$/.test(s));
      table.forEach((row) => {
        stat.spi.staus.push({
          slave: row.slice(0, 5).trim(),
          ver: row.slice(5, 12).trim(),
          time: row.slice(12, 19).trim(),
          ping: row.slice(19, 25).trim(),
          masterToSlave: {
            tx: row.slice(25, 33).trim(),
            rx: row.slice(33, 38).trim(),
            err: row.slice(38, 43).trim(),
            percent: row.slice(43, 49).trim(),
          },
          slaveToMaster: {
            tx: row.slice(49, 57).trim(),
            rx: row.slice(57, 62).trim(),
            err: row.slice(62, 67).trim(),
            percent: row.slice(67).trim(),
          },
        });
      });
    }
  }

  return stat;
};
