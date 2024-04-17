import { IContent } from "@/interfaces/interface";
import { getBalance } from "@/services/account";
import { useState } from "react";

export default function useBalance(): {
    balance: IContent<number>;
    loadBalance: (address: string) => void;
} {
    const [balance, setBalance] = useState<IContent<number>>({
        status: "",
        loading: false,
        content: 0,
        message: ""
    });

    async function loadBalance(address: string) {
        if (balance.loading) return;
        setBalance({
            status: "",
            loading: true,
            content: 0,
            message: ""
        });
        getBalance(address)
            .then(res => {
                const bal = res.data?.balance ? res.data.balance / 1000000000 : 0;
                setBalance({
                    status: "success",
                    loading: false,
                    content: bal,
                    message: ""
                });
            }).catch(err => {
                setBalance({
                    status: "fail",
                    loading: false,
                    content: 0,
                    message: err.message
                });
            });
    }


    return {
        balance,
        loadBalance
    }

}