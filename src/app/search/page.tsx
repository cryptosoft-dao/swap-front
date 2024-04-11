"use client"
import { Grid } from "@/components/wrapper";
import SearchInput from "@/components/Form/SearchInput";
import { SuggestedToken, ListToken } from "@/components/Token";

import { tokens } from "@/utils/tokens";
import { useState } from "react";
import { IToken } from "@/interfaces/interface";

export default function Search() {

    const [search, setSearch] = useState("");

    function filter(token: IToken) {
        if (!search) return true;
        if (search.toLocaleLowerCase() === token.name.toLocaleLowerCase()) return true;
        return false;
    }

    return <div className="w-full">
        <Grid className="gap-3">
            <SearchInput value={search} handleSearch={(newValue) => setSearch(newValue)} />
            <Grid className="grid-cols-3 gap-2">
                {
                    tokens.slice(0, 3).map((token, index) => <SuggestedToken token={token} key={index} />)
                }
            </Grid>
        </Grid>
        <h2 className="text_20_700_SFText text-white my-6">Tokens</h2>
        <Grid className="w-full gap-6">
            {
                tokens.filter(filter).map((token, index) => <ListToken key={index} token={token} />)
            }
        </Grid>
    </div>
}