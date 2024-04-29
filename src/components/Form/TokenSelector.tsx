import React, { useEffect, useState } from "react";
import Image from "next/image";


import useInfiniteScroll from "@/hooks/useInfiniteScroll";

import { Flex, Grid } from "@/components/wrapper";
import SearchInput from "@/components/Form/SearchInput";
import { SuggestedToken, ListToken, TokenIcon, TokenName } from "@/components/Token";
import Footer from "@/components/Footer";
import { CircularLoader, SkeletonLoader } from "@/components/Loader";

import ArrowUp from "@/assets/icons/down-icon.svg";

import { IToken } from "@/interfaces/interface";

interface ISelectorProps {
    selectedToken?: IToken;
    toggleSelector: () => void;
    className?: string;
}

interface ISearchProps {
    selectToken: (token: IToken) => void;
    tokens: IToken[];
    active: boolean;
    className?: string;
}

function Search(props: ISearchProps) {

    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [componentVisibility, setComponentVisibility] = useState<boolean>(true);
    const [list, setList] = useState<IToken[]>([]);
    const [query, setQuery] = useState({
        page: 0,
        skip: 0,
        limit: 15,
        active: true
    })
    const { containerRef } = useInfiniteScroll(() => {
        setLoading(true);
        query.page = query.page + 1;
        query.skip = query.limit * query.page;
        setQuery({ ...query });
    });

    function filter(token: IToken) {
        if (!search) return true;
        const lsearch = search.toLocaleLowerCase();
        const bysymbol = lsearch === token.symbol.toLocaleLowerCase();
        const byname = lsearch === token.name.toLocaleLowerCase();
        const byaddress = token.address && lsearch === token.address.toLocaleLowerCase();
        return bysymbol || byname || byaddress;
    }

    useEffect(() => {
        if (!search) {
            const newTokenList = [...props.tokens].splice(0, query.limit);
            setList(newTokenList);
        } else {
            const searchTokens = props.tokens.filter(filter);
            setList(searchTokens);
        }
    }, [search]);

    useEffect(() => {
        if (!query.active) {
            setLoading(false);
            return;
        }
        const newTokenList = [...props.tokens].splice(query.skip, query.limit);
        if (!newTokenList.length) {
            query.active = false;
            setQuery({ ...query });
            return;
        }
        setList([...list, ...newTokenList]);
        setLoading(false);
    }, [query]);

    useEffect(() => {
        setList([]);
        setQuery({
            page: 0,
            skip: 0,
            limit: 15,
            active: true
        })
    }, [props.tokens]);

    useEffect(() => {
        if (!containerRef.current) return;
        const originalHeight = 100;
        function checkScroll() {
            if (!containerRef.current) return;
            const isMoreThanHeight = containerRef.current?.scrollTop > originalHeight;
            if (isMoreThanHeight) {
                componentVisibility && setComponentVisibility(false);
            } else {
                setComponentVisibility(true);
            }
        }
        containerRef.current.addEventListener('scroll', checkScroll);

        return () => {
            containerRef.current?.removeEventListener('scroll', checkScroll);
        }

    }, []);

    return <Flex className={`flex-col bg-primary fixed top-0 left-0 p-6 h-full m-auto z-40 ${props.className} ${props.active ? '' : '!hidden'}`}>
        <div className="flex flex-col h-full max-w-[480px] mx-auto">
            <div className={`flex flex-col gap-3 overflow-hidden`} style={{
                height: componentVisibility ? '234px' : '0px',
                transition: "all 0.4s"
            }}>
                <SearchInput value={search} handleSearch={(newValue) => setSearch(newValue)} />
                <Flex className="gap-2 h-fit flex-wrap">
                    {
                        props.tokens.slice(0, 7).map((token, index) => <SuggestedToken
                            token={token}
                            key={index}
                            select={() => props.selectToken(token)}
                        />)
                    }
                </Flex>
            </div>
            <h2 className="text_20_700_SFText text-white mb-6">Tokens</h2>
            <div className="flex-1 pb-6 overflow-y-auto" ref={containerRef}>
                <div className="w-full grid gap-6">
                    {
                        list.map((token, index) => {
                            return <ListToken
                                key={index}
                                token={token}
                                select={() => props.selectToken(token)}
                            />
                        })
                    }
                    {loading && <CircularLoader className="mx-auto my-1" />}
                </div>
            </div>
            <Footer />
        </div>
    </Flex >
}

export const MemoizedSearch = React.memo(Search);

export function TokenSelector(props: ISelectorProps) {
    return <div className={`!w-[170px] my-auto ${props.className}`}>
        {props.selectedToken ? <Flex className="!w-full ml-auto cursor-pointer justify-end" click={props.toggleSelector}>
            <TokenIcon icon={props.selectedToken.image} name={props.selectedToken.name} />
            <Flex className="!w-fit gap-[6px] ml-[6px] my-auto justify-end">
                <TokenName className="!max-w-[60px]" name={props.selectedToken.symbol} />
                <Image src={ArrowUp} alt="down" className="!min-w-[9px] my-auto" />
            </Flex>
        </Flex> : <SkeletonLoader styles="w-[100px] h-[30px]" />}
    </div>
}
