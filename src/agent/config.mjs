import nconf from "nconf";

nconf
  .argv({
    "miner-conf-path": {
      alias: "c",
      description: "Путь к файлу конфигурации майнера",
    },
    dev: {
      alias: "d",
      description: "Работа в режиме разработки",
      type: "boolean",
    },
  })
  .env({
    lowerCase: true,
    parseValues: true,
    transform(obj) {
      if (obj.key === "node_env") {
        return {
          key: "dev",
          value: obj.value === "development",
        };
      } else if (obj.key === "miner_conf_path") {
        return {
          key: "miner-conf-path",
          value: obj.value,
        };
      }
      return obj;
    },
  })
  .file({ file: "config.json" })
  .defaults({
    dev: false,
    host: "localhost",
    port: "3000",
  })
  .required(["miner-conf-path"]);

export default nconf;
