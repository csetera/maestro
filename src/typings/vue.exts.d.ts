import * as winston from 'winston';

declare module 'vue/types/vue' {
  interface Vue {
    $logger: winston.Logger;
  }
}
