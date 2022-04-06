import nconf from "nconf";

nconf
  .argv({
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
  .required([]);

export default nconf;
