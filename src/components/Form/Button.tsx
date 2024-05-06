interface IButtonProps {
    name: string | React.ReactNode;
    click?: () => void;
    className?: string;
    disabled?: boolean;
}
export function PrimaryButton(props: IButtonProps) {
    return <button
        onClick={props.click}
        className={`block w-full p-4 text-white text_14_600_SFDisplay outline-none border-transparent rounded-[13px] ${props.disabled ? "bg-[#27292E] !cursor-not-allowed" : "bg-blue"} ${props.className}`}
        disabled={props.disabled}
    >
        {props.name}
    </button>
}
