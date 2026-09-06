import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#141414] group-[.toaster]:text-white group-[.toaster]:border-[#242424] group-[.toaster]:shadow-2xl group-[.toaster]:rounded-xl font-['Poppins']",
          description: "group-[.toast]:text-white/60",
          actionButton:
            "group-[.toast]:bg-[#FE5000] group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-[#1E1E1E] group-[.toast]:text-white/60",
          error: "group-[.toaster]:!bg-[#141414] group-[.toaster]:!text-red-400 group-[.toaster]:!border-red-500/40",
          success: "group-[.toaster]:!bg-[#141414] group-[.toaster]:!text-emerald-400 group-[.toaster]:!border-emerald-500/40",
          warning: "group-[.toaster]:!bg-[#141414] group-[.toaster]:!text-amber-400 group-[.toaster]:!border-amber-500/40",
          info: "group-[.toaster]:!bg-[#141414] group-[.toaster]:!text-blue-400 group-[.toaster]:!border-blue-500/40",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
export default Toaster;
