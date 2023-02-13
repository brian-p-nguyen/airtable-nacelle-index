import {initializeBlock, useBase, useRecords, TextButton} from '@airtable/blocks/ui';
import { nacelleIndex } from '../utils/nacelleIndex';
import React, { useEffect } from 'react';
import useIndexStatus from '../hooks/useIndexStatus';

function HelloWorldApp() {
    // const [isIndexing] = useIndexStatus()

    // useEffect(() => {

    // }, [isIndexing]);

    const base = useBase();
    const productTable = base.getTableByName("Products");
    const products = useRecords(productTable, {sorts: [
        {field: 'Handles'}
    ]});

    // const allProducts = products.map(product => {
    //     return (
    //         <div key={product.id}>
    //             {product.getCellValueAsString("Tags")}
    //         </div>
    //     )
    // })

    return <div>
        <TextButton onClick={nacelleIndex(products)}>Index</TextButton>
    </div>
}

initializeBlock(() => <HelloWorldApp />);
