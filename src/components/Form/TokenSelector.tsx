import React, { useEffect, useState } from "react";
import Image from "next/image";

import { useAccount } from "@/context/AccountProvider";

import { Flex, Grid } from "@/components/wrapper";
import SearchInput from "@/components/Form/SearchInput";
import { SuggestedToken, ListToken, TokenIcon, TokenName } from "@/components/Token";
import Footer from "@/components/Footer";

import ArrowUp from "@/assets/icons/down-icon.svg";

import { IToken } from "@/interfaces/interface";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import { CircularLoader } from "../Loader";

interface ISelectorProps {
    selectedToken: IToken;
    selectToken: (token: IToken) => void;
    className?: string;
}

interface ISearchProps {
    selectToken: (token: IToken) => void;
    className?: string;
}

function Search(props: ISearchProps) {

    const { tokens } = useAccount();
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(false);
    const [componentVisibility, setComponentVisibility] = useState<boolean>(true);
    const [list, setList] = useState<IToken[]>([]);
    const [query, setQuery] = useState({
        page: 0,
        skip: 0,
        limit: 15
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
            const newTokenList = [...tokens].splice(0, query.limit);
            setList(newTokenList);
        } else {
            const searchTokens = tokens.filter(filter);
            setList(searchTokens);
        }
    }, [search]);

    useEffect(() => {
        const newTokenList = [...tokens].splice(query.skip, query.limit);
        if (list[0]?.address === newTokenList[0].address) {
            setList([...newTokenList]);
        } else {
            setList([...list, ...newTokenList]);
        }
        setLoading(false);
    }, [query, tokens]);

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

    return <Flex className={`flex-col bg-primary absolute top-0 left-0 p-6 h-full max-w-[480px] ${props.className}`}>
        <div className={`grid gap-3 overflow-hidden`} style={{
            height: componentVisibility ? '210px' : '0px',
            marginBottom: componentVisibility ? "24px" : "0",
            transition: "all 0.4s"
        }}>
            <SearchInput value={search} handleSearch={(newValue) => setSearch(newValue)} />
            <Flex className="gap-2 flex-wrap">
                {
                    tokens.slice(0, 7).map((token, index) => <SuggestedToken
                        token={token}
                        key={index}
                        select={() => props.selectToken(token)}
                    />)
                }
            </Flex>
        </div>
        <h2 className="text_20_700_SFText text-white mb-6">Tokens</h2>
        <div className="flex-1 overflow-y-auto pb-6" ref={containerRef}>
            <Grid className="w-full gap-6">
                {
                    list.map((token, index) => <ListToken
                        key={index}
                        token={token}
                        select={() => props.selectToken(token)}
                    />)
                }
                {loading && <CircularLoader className="mx-auto my-1" />}
            </Grid>
        </div>
        <Footer />
    </Flex >
}

const MemoizedSearch = React.memo(Search);

export function TokenSelector(props: ISelectorProps) {
    const [show, setShow] = useState(false);
    return <div className={`!w-[170px] my-auto ${props.className}`}>
        <Flex className="!w-full ml-auto cursor-pointer justify-end" click={() => setShow(!show)}>
            <TokenIcon icon={props.selectedToken.image} name={props.selectedToken.name} />
            <Flex className="!w-fit gap-[6px] ml-[6px] my-auto justify-end">
                <TokenName className="!max-w-[60px]" name={props.selectedToken.symbol} />
                <Image src={ArrowUp} alt="down" className="!min-w-[9px] my-auto" />
            </Flex>
        </Flex>
        {
            <MemoizedSearch
                className={show ? "" : "!hidden"}
                selectToken={(token) => {
                    props.selectToken(token);
                    setShow(!show)
                }}
            />
        }
    </div>
}
