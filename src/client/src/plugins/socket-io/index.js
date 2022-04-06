import socketIo from "socket.io-client";
import { inject, onMounted, onUnmounted, ref } from "vue";

const socketKey = Symbol("[socket.io] socket");

export function createSocket(options) {
  const io = socketIo({ ...options, autoConnect: false });

  // const socket = {
  io.install = function (Vue) {
    const socket = this;

    Vue.provide(socketKey, socket);

    const mountApp = Vue.mount;
    const unmountApp = Vue.unmount;
    Vue.mount = function (...args) {
      io.connect();
      mountApp(...args);
    };
    Vue.unmount = function () {
      io.disconnect();
      unmountApp();
    };
  };
  // };
  return io;
}

export function useEvent(eventName) {
  const socket = inject(socketKey);
  const res = ref([]);
  onMounted(() => socket.on(eventName, (data) => (res.value = data)));
  onUnmounted(() => socket.off(eventName));
  return {
    data: res,
  };
}
