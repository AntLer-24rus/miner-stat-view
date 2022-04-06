<template>
  <el-table :data="rows" style="width: 100%">
    <el-table-column prop="date" width="105" label="#" />
    <el-table-column prop="date" width="105" label="UID" />
    <el-table-column prop="date" width="105" label="SOL" />
    <el-table-column prop="date" width="105" label="ERR" />
    <el-table-column prop="date" width="105" label="bySol" />
    <el-table-column prop="date" width="105" label="E/S" />
    <el-table-column prop="date" width="105" label="JOBS" />
    <el-table-column prop="date" width="105" label="CR" />
    <el-table-column prop="date" width="105" label="W/GHs" />
    <el-table-column prop="date" width="105" label="EPWC" />
  </el-table>
</template>
<script>
export default {
  name: "EventStatTable",
  props: {
    rows: { type: Array, default: () => [] },
  },
};
</script>
