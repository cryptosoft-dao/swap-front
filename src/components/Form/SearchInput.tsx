import { Box } from "../wrapper";

export default function SearchInput(props: { value: string; handleSearch: (newValue: string) => void; }) {
    return <Box className={`flex px-6 py-4`}>
        <input
            className="w-full outline-none bg-transparent font-[600] text-white"
            value={props.value}
            onChange={(event) => props.handleSearch(event.currentTarget.value)}
            placeholder="Search name or paste address"
        />
    </Box>
}