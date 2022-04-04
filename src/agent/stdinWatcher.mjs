import { Writable } from "node:stream";
import { LogFilter, FmParser } from "./fmParser.mjs";
import EventEmitter from "node:events";

export class Watcher extends EventEmitter {
  watch() {
    const self = this;
    process.stdin
      .pipe(new LogFilter())
      .pipe(new FmParser())
      .on("error", (err) => self.emit("error", err))
      .pipe(
        new Writable({
          objectMode: true,
          write(data, _, done) {
            self.emit("data", data);
            done();
          },
          final(done) {
            self.emit("finish");
            done();
          },
        })
      );
  }
}
