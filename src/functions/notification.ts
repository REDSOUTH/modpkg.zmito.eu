import { toast } from "sonner";

export interface NotificationHelper {
  default: (text: string, close?: boolean) => void;
  warn: (text: string, close?: boolean) => void;
  error: (text: string, close?: boolean) => void;
  success: (text: string, close?: boolean) => void;
}

const notification: NotificationHelper = {
  default: function (text: string) {
    toast.success(text);
  },

  warn: function (text: string) {
    toast.warning(text);
  },

  error: function (text: string) {
    toast.error(text);
  },

  success: function (text: string) {
    toast.success(text);
  },
};

export { toast };
export default notification;
