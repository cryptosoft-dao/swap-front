interface IButtonProps {
    name: string;
    click?: () => void;
    className?: string;
}
export function PrimaryButton(props: IButtonProps) {
    return <button onClick={props.click} className={`block w-full p-4 text-white text_14_600_SFDisplay bg-blue outline-none border-transparent rounded-[10px] ${props.className}`}>
        {props.name}
    </button>
}