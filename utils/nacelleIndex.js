import { useBase, useRecords } from "@airtable/blocks/ui";
import useIndexStatus from "../hooks/useIndexStatus";

export function nacelleIndex (products) {
    // Loop over Parent Products
    products.forEach((product) => {
        if (!product.getCellValueAsString("Parent Product")) {
            ingestProduct(product, products)
        }
    })
}

function ingestProduct(product, products) {
    fetch('https://ingest.api.nacelle.com/graphql', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-nacelle-ingest-token": "5fa6b2e9-9155-496d-99e8-b95f0feb14b9",
            "x-nacelle-source-id": "e6a3c3e4-cade-4f6a-b165-d2e04c24663b",
            "x-nacelle-space-id": "565f891a-c1ab-44f5-a860-1b10b400852b"
        },
        body: JSON.stringify({
            query: `
                mutation productCreate($input: [ProductInput!]!) {
                    productCreate(input: $input) {
                        message
                        affectedIds {
                            entryType
                            sourceEntryId
                            nacelleEntryId
                        }
                    }
                }
            `,
            variables: {
                input: [
                    mapProduct(product, products)
                ]
            }
        })
    })
    .then ((res) => res.json())
    .then(result => console.log(result))
    .catch(err => console.log('error', err))
}

function mapProduct(product, products) {
    return {
        sourceEntryId: product.id,
        availableForSale: true,
        tags: [product.getCellValueAsString("Tags")],
        content: [
            {
                published: true,
                title: product.getCellValueAsString("Name"),
                sourceEntryId: product.id,
                locale: "EN_US",
                handle: product.getCellValueAsString("Handles"),
                featuredMedia: {
                    src: product.getCellValueAsString("Image Src"),
                    thumbnailSrc: product.getCellValueAsString("Image Src"),
                    type: "IMAGE",
                },
                media: {
                    src: product.getCellValueAsString("Image Src"),
                    thumbnailSrc: product.getCellValueAsString("Image Src"),
                    type: "IMAGE",                    
                },
                description: product.getCellValueAsString("Description"),
                // options: mapOptions(product, products)
            }
        ],
        variants: mapVariantToProduct(product, products)
    }
}

function mapVariantToProduct(product, products) {
    const productHandle = product.getCellValueAsString("Handles");

    let variants = [];

    // push current line in
    variants.push(
        {
            sourceEntryId: product.id,
            content: [
                {
                    sourceEntryId: product.id,
                    selectedOptions: [
                        {
                            name: product.getCellValueAsString("Option1 Name"),
                            value: product.getCellValueAsString("Option1 Value")
                        }
                    ],
                    featuredMedia: {
                        src: product.getCellValueAsString("Variant Image") ? product.getCellValueAsString("Variant Image") : product.getCellValueAsString("Image Src"),
                        thumbnailSrc: product.getCellValueAsString("Variant Image") ? product.getCellValueAsString("Variant Image") : product.getCellValueAsString("Image Src"),
                        type: "IMAGE",
                    },
                    media: {
                        src: product.getCellValueAsString("Variant Image") ? product.getCellValueAsString("Variant Image") : product.getCellValueAsString("Image Src"),
                        thumbnailSrc: product.getCellValueAsString("Variant Image") ? product.getCellValueAsString("Variant Image") : product.getCellValueAsString("Image Src"),
                        type: "IMAGE",                    
                    },
                }, 
            ], 
            price: product.getCellValueAsString("Price").replace("$", ""),
            priceCurrency: "USD",
        }
    )

    let moreVariants = products.map((variant) => {
        if (variant.getCellValueAsString("Parent Product") === productHandle) {
            return {
                sourceEntryId: variant.id,
                content: [
                    {
                        selectedOptions: [
                            {
                                name: product.getCellValueAsString("Option1 Name"),
                                value: variant.getCellValueAsString("Option1 Value")
                            }
                        ],
                        sourceEntryId: variant.id,
                        locale: "EN_US",
                        featuredMedia: {
                            src: variant.getCellValueAsString("Variant Image"),
                            thumbnailSrc: variant.getCellValueAsString("Variant Image"),
                            type: "IMAGE",
                        },
                        media: {
                            src: variant.getCellValueAsString("Variant Image"),
                            thumbnailSrc: variant.getCellValueAsString("Variant Image"),
                            type: "IMAGE",                    
                        },
                    }
                ],
                price: variant.getCellValueAsString("Price").replace("$", ""),
                priceCurrency: "USD",
                priceRules: [
                    {
                        // compareAtPrice: variant.getCellValueAsString("Compare At Price").replace("$", ""),
                        price: variant.getCellValueAsString("Price").replace("$", ""),
                        priceCurrency: "USD",
                        priceBreaks:[],
                        title: 'Default Price Rule',
                        country: 'US'
                    }
                ]
            }
        }
    })

    if(moreVariants && moreVariants.length > 0){
        variants = variants.concat(moreVariants)
    }

    variants = variants.filter(variant => variant)

    return variants;
}

function mapOptions(product, products) {

}