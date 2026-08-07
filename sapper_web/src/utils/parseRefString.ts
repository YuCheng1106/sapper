interface Params {
    [key: string]: string; // 允许任意字符串键，值为string类型
}

interface ParseResult {
    type: 'refData' | 'refAPI' | 'refParameter';
    uuid: string;
    query: Params;
    outputVariable: string;
}

export function parseRefString(template: string): ParseResult {
    // 初始化返回对象
    const initResult: ParseResult = {
        type: 'refData',
        uuid: '',
        query: {},
        outputVariable: '',
    };

    // 先统一移除 ${ 和 }$
    const cleanedTemplate = template.replace(/\${/g, '').replace(/\}\$/g, '');

    // 尝试匹配三种模式
    const refDataPattern = /~refData\{([^}]*)\}\[([^\]]*)\]\[([^\]]*)\]\s*\/refData/;
    const refAPIPattern = /^~refAPI\{([^}]*)\}\[(.*)\]\[(.*)\]\/(refAPI)$/;
    const refParameterPattern = /~refParameter\{([^}]*)\}\s*\/refParameter/;

    // 尝试匹配 refData
    let match = cleanedTemplate.match(refDataPattern);
    if (match && match.length >= 4) {
        const uuid = match[1].trim();
        const queryStr = match[2].trim();
        const outputVariable = match[3].trim();

        try {
            const query = queryStr ? JSON.parse(queryStr) : {};
            return {
                type: 'refData',
                uuid,
                query,
                outputVariable
            };
        } catch (e) {
            console.error("Failed to parse query JSON:", e);
            return {
                ...initResult,
                type: 'refData',
                uuid,
                outputVariable
            };
        }
    }

    // 尝试匹配 refAPI
    match = cleanedTemplate.match(refAPIPattern);
    if (match && match.length >= 4) {
        const uuid = match[1].trim();
        const queryStr = match[2].trim();
        const outputVariable = match[3].trim();

        try {
            const query = queryStr ? JSON.parse(queryStr) : {};
            return {
                type: 'refAPI',
                uuid,
                query,
                outputVariable
            };
        } catch (e) {
            console.error("Failed to parse query JSON:", e);
            return {
                ...initResult,
                type: 'refAPI',
                uuid,
                outputVariable
            };
        }
    }

    // 尝试匹配 refParameter
    match = cleanedTemplate.match(refParameterPattern);
    if (match && match.length >= 2) {
        return {
            type: 'refParameter',
            uuid: match[1].trim(),
            query: {},
            outputVariable: ''
        };
    }

    // 没有匹配到任何模式
    return initResult;
}
