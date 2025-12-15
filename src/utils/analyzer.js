
export const getCrossReference = (arcaList, sidrelList) => {
    // Create a Set of SIDREL CUITs for O(1) lookup
    // Using simple CUIT matching.
    const sidrelSet = new Set(sidrelList.map(item => item.cuit));

    // Filter ARCA list to find those NOT in SIDREL
    // Requirement: "analisis vamos a comparar que cuit aparece en arca y no aparece en sidrel"
    const notInSidrel = arcaList.filter(arcaItem => !sidrelSet.has(arcaItem.cuit));

    return notInSidrel;
};
