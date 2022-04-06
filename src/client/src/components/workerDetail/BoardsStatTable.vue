<script>
export default {
  name: "BoardsStatTable",
  props: {
    boards: { type: Array, default: () => [] },
  },
  setup() {},
};
</script>

<template>
  <el-table :data="boards" style="width: 100%">
    <el-table-column prop="id" label="#" />
    <el-table-column prop="uid" label="UID" />
    <el-table-column prop="total.sol" label="SOL" />
    <el-table-column prop="total.err" label="ERR" />
    <el-table-column prop="total.bySol" label="bySol" />
    <el-table-column prop="total['e/s']" label="E/S" />
    <el-table-column prop="total.jobs" label="JOBS" />
    <el-table-column prop="total.cr" label="CR" />
    <el-table-column prop="total['w/GHz']" label="W/GHs" />
    <el-table-column prop="total.epwc" label="EPWC" />
  </el-table>
</template>
