<script>
import { computed, ref } from "vue";
import { useEvent } from "@/plugins/socket-io";
export default {
  setup() {
    const { data: miners } = useEvent("miner-list");

    const getUptime = (secs) => {
      const day = 86400;
      const hour = 3600;
      const minute = 60;

      const days = String(Math.floor(secs / day));
      const hours = String(Math.floor((secs % day) / hour)).padStart(2, "0");
      const minutes = String(
        Math.floor(((secs % day) % hour) / minute)
      ).padStart(2, "0");
      const seconds = String(((secs % day) % hour) % minute).padStart(2, "0");

      return days > 0
        ? `${days}d ${hours}:${minutes}:${seconds}`
        : `${hours}:${minutes}:${seconds}`;
    };

    const tableRows = computed(() => {
      return miners.value.map((miner) => ({
        status: miner.online ? "online" : "offline",
        name: miner.stat?.pool.user.split(".")[1] ?? "load",
        temp: {
          avr: Math.round(
            miner.stat?.boards.reduce(
              (acc, i) => acc + parseInt(i.t.replace("C", "")),
              0
            ) / miner.stat?.boards.length
          ),
          min: Math.min(
            ...(miner.stat?.boards.map((i) => parseInt(i.t.replace("C", ""))) ??
              [])
          ),
          max: Math.max(
            ...(miner.stat?.boards.map((i) => parseInt(i.t.replace("C", ""))) ??
              [])
          ),
        },
        performance: {
          sumDelta: miner.stat?.boards.reduce(
            (acc, i) => acc + parseInt(i.delta.bySol.replace(" GH/s", "")),
            0
          ),
          sumTotal: miner.stat?.boards.reduce(
            (acc, i) => acc + parseInt(i.total.bySol.replace(" GH/s", "")),
            0
          ),
          minDelta: Math.min(
            ...(miner.stat?.boards.map((i) =>
              parseInt(i.delta.bySol.replace(" GH/s", ""))
            ) ?? [])
          ),
          maxDelta: Math.max(
            ...(miner.stat?.boards.map((i) =>
              parseInt(i.delta.bySol.replace(" GH/s", ""))
            ) ?? [])
          ),
        },
        power: {
          current: miner.stat?.master.server.i,
          voltage: miner.stat?.master.server.u,
          boardsCurrent: miner.stat?.boards.reduce(
            (acc, i) => acc + parseInt(i.i_SYS.replace("I0:", "")),
            0
          ),
        },
        boardsCount: miner.stat?.boards.length ?? 0,
        boards: miner.stat?.boards ?? [],
        uptime: getUptime(miner.stat?.totalTime ?? 0),
        net: { ip: miner.info.ip, mac: miner.info.mac },
      }));
    });

    const table = ref(null);
    const activeTab = ref("boards");
    const rowClick = (row) => {
      table.value.toggleRowExpansion(row);
    };

    return { tableRows, table, rowClick, activeTab };
  },
};
</script>

<template>
  <el-table
    ref="table"
    :data="tableRows"
    @row-click="rowClick"
    style="width: 100%"
  >
    <el-table-column prop="status" label="Статус" width="70" />
    <el-table-column prop="name" label="Воркер" width="180" />
    <el-table-column label="Температура" width="180">
      <template #default="{ row }">
        {{ row.temp.avr }}
        <el-tag size="mini">{{ row.temp.min }}</el-tag
        >/
        <el-tag size="mini" type="danger">{{ row.temp.max }}</el-tag>
      </template>
    </el-table-column>
    <el-table-column label="Производительность">
      <template #default="{ row }">
        <div>
          {{ row.performance.sumDelta }} / {{ row.performance.sumTotal }}
        </div>
        <div>
          {{ row.performance.minDelta }} / {{ row.performance.maxDelta }}
        </div>
      </template>
    </el-table-column>
    <el-table-column label="Потребление">
      <template #default="{ row }">
        <div>{{ row.power.current }} / {{ row.power.voltage }}</div>
        <div>{{ row.power.boardsCurrent }}</div>
      </template>
    </el-table-column>
    <el-table-column prop="boardsCount" label="Хеш-плат" />
    <el-table-column prop="uptime" label="UpTime" />
    <el-table-column label="Сеть">
      <template #default="{ row }">
        <div>{{ row.net.ip }}</div>
        <div>{{ row.net.mac }}</div>
      </template>
    </el-table-column>
    <el-table-column type="expand">
      <template #default="{ row }">
        <el-card>
          <el-tabs type="card" v-model="activeTab">
            <el-tab-pane label="BOARDS STATS" name="boards">
              <BoardsStatTable :boards="row.boards" />
            </el-tab-pane>
            <el-tab-pane label="MASTER STATS" name="master">
              <MasterStatTable />
            </el-tab-pane>
            <el-tab-pane label="POOL STATS" name="pool">
              <PoolStatTable />
            </el-tab-pane>
            <el-tab-pane label="EVENT STATS" name="event">
              <EventStatTable />
            </el-tab-pane>
            <el-tab-pane label="SPI BUS STATS" name="spiBus">
              <SpiBusStatTable />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </template>
    </el-table-column>
  </el-table>
</template>

<!-- <script>
import dataFromServer from "../../data.json";

console.log("dataFromServer :>> ", dataFromServer);

export default {
  name: "FarmDetail",
  data() {
    return {
      headers: [
        { title: "Статус", field: "" },
        { title: "Воркер", field: "" },
        { title: "Температура, °C", field: "temp" },
        { title: "Производительность, GH/s", field: "" },
        { title: "Потребление, mA", field: "" },
        { title: "Эффективность, W / GH/s", field: "" },
        { title: "Хеш-плат", field: "" },
        { title: "Uptime", field: "" },
        { title: "Сеть", field: "" },
      ],
      workers: [
        {
          minerId:
            "32aae7d58d19ff23d1051e8ee2eb85065489793e13e62379a0be6e3762291f4c",
          ip: "172.17.70.208",
          mac: "00:15:5d:cc:d0:d4",
          stat: dataFromServer,
        },
      ],
      expandRow: null,
    };
  },
  sockets: {
    testEventName(data) {
      console.log("data", data);
      // this.$socket.emit("stat", { test: 1 });
    },
  },
  computed: {
    tableRows: {
      get() {
        return this.workers.map((w) => ({
          status: "offline",
          name: w.stat.pool.user.split(".")[1],
          temp: {
            avr: Math.round(
              w.stat.boards.reduce(
                (acc, i) => acc + parseInt(i.t.replace("C", "")),
                0
              ) / w.stat.boards.length
            ),
            min: Math.min(
              ...w.stat.boards.map((i) => parseInt(i.t.replace("C", "")))
            ),
            max: Math.max(
              ...w.stat.boards.map((i) => parseInt(i.t.replace("C", "")))
            ),
          },
          performance: {
            sumDelta: w.stat.boards.reduce(
              (acc, i) => acc + parseInt(i.delta.bySol.replace(" GH/s", "")),
              0
            ),
            sumTotal: w.stat.boards.reduce(
              (acc, i) => acc + parseInt(i.total.bySol.replace(" GH/s", "")),
              0
            ),
            minDelta: Math.min(
              ...w.stat.boards.map((i) =>
                parseInt(i.delta.bySol.replace(" GH/s", ""))
              )
            ),
            maxDelta: Math.max(
              ...w.stat.boards.map((i) =>
                parseInt(i.delta.bySol.replace(" GH/s", ""))
              )
            ),
          },
          power: {
            current: w.stat.master.server.i,
            voltage: w.stat.master.server.u,
            boardsCurrent: w.stat.boards.reduce(
              (acc, i) => acc + parseInt(i.i_SYS.replace("I0:", "")),
              0
            ),
          },
          boards: w.stat.boards.length,
          uptime: this.getUptime(w.stat.totalTime),
          net: { ip: w.ip, mac: w.mac },
        }));
      },
    },
  },
  methods: {
    getUptime(secs) {
      const day = 86400;
      const hour = 3600;
      const minute = 60;

      const days = String(Math.floor(secs / day));
      const hours = String(Math.floor((secs % day) / hour)).padStart(2, "0");
      const minutes = String(
        Math.floor(((secs % day) % hour) / minute)
      ).padStart(2, "0");
      const seconds = String(((secs % day) % hour) % minute).padStart(2, "0");

      return days > 0
        ? `${days}d ${hours}:${minutes}:${seconds}`
        : `${hours}:${minutes}:${seconds}`;
    },
  },
};
</script> -->

<style lang="scss">
.detail-row {
  &:hover {
    background: none !important;
  }
  & > td {
    padding-left: 0;
    padding-right: 0;
  }
}
</style>
