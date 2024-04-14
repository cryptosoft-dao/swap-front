import { useState } from "react";
import Image from "next/image";

import { Flex, Grid } from "@/components/wrapper";
import SearchInput from "@/components/Form/SearchInput";
import { SuggestedToken, ListToken } from "@/components/Token";
import Footer from "@/components/Footer";

import { tokens } from "@/utils/tokens";
import ArrowUp from "@/assets/icons/down-icon.svg";

import { IToken } from "@/interfaces/interface";

interface ISelectorProps {
    selectedToken: IToken;
    selectToken: (token: IToken) => void;
    tokens: IToken[];
    className?: string;
}

interface ISearchProps {
    selectToken: (token: IToken) => void;
    className?: string;
}

function Search(props: ISearchProps) {

    const [search, setSearch] = useState("");

    function filter(token: IToken) {
        if (!search) return true;
        if (search.toLocaleLowerCase() === token.name.toLocaleLowerCase()) return true;
        return false;
    }

    return <Flex className={`flex-col bg-primary absolute top-0 left-0 p-5 h-full max-w-[480px] ${props.className}`}>
        <Grid className="gap-3">
            <SearchInput value={search} handleSearch={(newValue) => setSearch(newValue)} />
            <Flex className="gap-2 flex-wrap">
                {
                    tokens.slice(0, 3).map((token, index) => <SuggestedToken
                        token={token}
                        key={index}
                        select={() => props.selectToken(token)}
                    />)
                }
            </Flex>
        </Grid>
        <h2 className="text_20_700_SFText text-white my-6">Tokens</h2>
        <Grid className="w-full gap-6">
            {
                tokens.filter(filter).map((token, index) => <ListToken
                    key={index}
                    token={token}
                    select={() => props.selectToken(token)}
                />)
            }
        </Grid>
        <Footer />
    </Flex>
}

export function TokenSelector(props: ISelectorProps) {
    const [show, setShow] = useState(false);
    return <div className={`!w-[170px] my-auto ${props.className}`}>
        <Flex className="!w-fit ml-auto cursor-pointer" click={() => setShow(!show)}>
            <Image width={24} height={24} className="!w-[24px] !h-[24px]" src={props.selectedToken.icon} alt={props.selectedToken.name} />
            <Flex className="!w-full gap-[6px] ml-[6px] my-auto">
                <span className="block text_14_400_SFText leading-none text-white my-auto">{props.selectedToken.name}</span>
                <Image src={ArrowUp} alt="down" className="min-w-[4px] my-auto" />
            </Flex>
        </Flex>
        {
            <Search
                className={show ? "" : "!hidden"}
                selectToken={(token) => {
                    props.selectToken(token);
                    setShow(!show)
                }}
            />
        }
    </div>
}
