import { useState } from "react";

export default function useIndexStatus() {
    const [ isIndexing, setIndexing ] = useState(false);
    return isIndexing
}