import Toastify from 'toastify-js';
import "toastify-js/src/toastify.css";

export interface NotificationHelper {
  default: (text: string, close?: boolean) => void;
  warn: (text: string, close?: boolean) => void;
}

const notification: NotificationHelper = {
  default: function(text: string, close = false) {
    Toastify({
      text: text,
      duration: 3000,
      close: close,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
      offset: {
        x: 0,
        y: 0
      },
      style: {
        "background": "#2c2c2c",
        "box-shadow": "0 0 0 0",
        "padding": "12px",
        "border-radius": "6px",
        "cursor": "default"
      },
    }).showToast();
  },

  warn: function(text: string, close = false) {
    Toastify({
      text: text,
      duration: 10000,
      close: close,
      gravity: "bottom",
      position: "right",
      stopOnFocus: true,
      offset: {
        x: 0,
        y: 0
      },
      style: {
        "background": "#FF6600",
        "box-shadow": "0 0 0 0",
        "padding": "12px",
        "border-radius": "6px",
        "cursor": "default"
      },
    }).showToast();
  }
};

export default notification;
