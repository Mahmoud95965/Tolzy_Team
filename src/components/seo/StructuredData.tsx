'use client';

interface StructuredDataProps {
    data: object | object[];
}

/**
 * Client-safe component for injecting JSON-LD structured data
 * @param data - Schema.org structured data object or array
 */
export function StructuredData({ data }: StructuredDataProps) {
    const jsonData = Array.isArray(data) ? data : [data];

    return (
        <>
            {jsonData.map((schema, index) => (
                <script
                    key={index}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
            ))}
        </>
    );
}
