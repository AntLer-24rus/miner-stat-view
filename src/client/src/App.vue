<!-- <script>
import { useEvent } from "@/plugins/socket-io";
export default {
  setup() {
    const { data: miners } = useEvent("miner-list");
    return { miners };
  },
};
</script> -->

<template>
  <el-container class="main-container" direction="vertical">
    <!-- <div v-for="miner in miners" :key="miner.id">{{ miner.id }}</div> -->
    <el-main>
      <farm-detail />
    </el-main>
  </el-container>
</template>
