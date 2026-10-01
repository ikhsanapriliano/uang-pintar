import { cn } from "@/lib/utils";
import { Input as AlfariziInput } from "@alfarizi/react-input";

const InputMoney = ({ className, ...props }: any) => {
  const value = props.value?.toString() || "";
  const raw = value.replace(/\D/g, "");
  const formatted = new Intl.NumberFormat("id-ID").format(Number(raw));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    const formatted = new Intl.NumberFormat("id-ID").format(Number(raw));

    e.target.value = formatted;
    props.onChange?.(raw);
  };

  return (
    <div className="relative w-full">
      <AlfariziInput
        type="text"
        inputMode="numeric"
        className={cn(
          "border bg-white rounded-md py-2 px-3 pl-9 text-sm w-full",
          className,
        )}
        disabled={props.disabled}
        {...props}
        value={value ? formatted : props.value}
        onChange={handleChange}
      />
      <p className="absolute left-3 top-0 bottom-0 h-full flex items-center text-sm font-medium text-muted-foreground">
        Rp.
      </p>
    </div>
  );
};

export default InputMoney;
