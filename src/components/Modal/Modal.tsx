import Image from "next/image";
import { ModalBox, ModalHead } from "./Modal.wrapper";

import RotateIcon from "@/assets/icons/recycle.svg";
import { Flex } from "../wrapper";

interface IPercentageProps {
    selected: boolean;
    percentage: number;
    select: () => void;
}

function Percentage(props: IPercentageProps) {
    return <div onClick={props.select} className={`flex border border-border_primary leading-none text-center text-white text_14_500_SFText rounded-[15px] py-2 ${props.selected ? "bg-blue" : ""}`}>
        <span className="m-auto">{props.percentage}%</span>
    </div>
}

export function InfoModal(props: { close: () => void; active: boolean }) {
    return <ModalBox active={props.active}>
        <div className={`p-6`}>
            <ModalHead heading="Completed" close={props.close} />
            <div className="mt-6">
                <p className="text_14_400_SFText leading-[16.71px] text-text_primary block">Your transaction completed successfully</p>
            </div>
        </div>
    </ModalBox>
}

export function ProgressModal(props: { active: boolean }) {
    return <ModalBox active={props.active}>
        <Flex className='!w-fit !px-7 py-6 m-auto flex-col justify-center'>
            <Image width={39} height={39} className="mx-auto infiniteRotate" src={RotateIcon} alt="transaction" />
            <h2 className="m-3 text_20_700_SFText text-white leading-none">Processing Transaction...</h2>
        </Flex>
    </ModalBox>
}