import {message} from "antd";

interface Section {
    subSectionType: string;
    content: string | { input: string; output: string } | string[];
}

interface Field {
    sectionType: string;
    section: Section[];
}

export const handleCopyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(text)
        .then(() => {
            message.success('Copy successfully to clipboard!');
        })
        .catch((err) => {
            message.error('Copy failed to clipboard: ', err);
        });
};

export const jsontoSPL = (splForm: Field[], splName: string): string => {
    let SPL = '';
    splForm.forEach((field: Field) => {
        const newField = {...field};
        const identifier = field.section.filter((section: Section) => (section.subSectionType === 'Name'));
        const example = field.section.filter((section: Section) => (section.subSectionType === 'Example'));
        const backgroundKnowledge = field.section.filter((section: Section) => (section.subSectionType === 'BackgroundKnowledge'));
        
        const backgroundKnowledgeSPL = backgroundKnowledge.length !== 0 ? backgroundKnowledge.map((exam: Section) => (
            `\t@backgroundKnowledge{\n\t\t${typeof exam.content === 'string' ? exam.content : ''}\n\t}\n`)) : '';

        const exampleSPL = example.length !== 0 ? example.map((exam: Section) => {
            const content = exam.content as { input: string; output: string };
            return `\t@example{\n\t\t@Input{\n\t\t\t${content.input.split('\n').join("\n\t\t\t")}\n\t\t}\n\t\t@Output{\n\t\t\t${content.output.split('\n').join("\n\t\t\t")}\n\t\t}\n\t}\n`;
        }) : '';

        newField.section = field.section.filter((section: Section) => (section.subSectionType !== 'Name'));
        newField.section = newField.section.filter((section: Section) => (section.subSectionType !== 'Example'));
        newField.section = newField.section.filter((section: Section) => (section.subSectionType !== 'BackgroundKnowledge'));
        
        let SectionSPL = '';
        SectionSPL = newField.section.map((section: Section) => (
            Array.isArray(section.content) 
                ? section.content.map((content: string) => (
                    `\t@${section.subSectionType} ${content.split("\n").join("\n\t\t")}`
                )).join('\n') + '\n'
                : `\t@${section.subSectionType}{\n\t\t${(typeof section.content === 'string' ? section.content : JSON.stringify(section.content)).split("\n").join("\n\t\t")}\n\t}`
        )).join('\n');

        SPL += `@${newField.sectionType} ${identifier.length !== 0 ? identifier[0].content : ''}{\n${SectionSPL}${example.length !== 0 ? exampleSPL : ''}${backgroundKnowledge.length !== 0 ? backgroundKnowledgeSPL : ''}\n}\n`;
    });

    SPL = "@Priming \"I will provide you the instructions to solve problems. The instructions will be written in a semi-structured format. You should executing all instructions as needed\"\n" +
        splName + "{\n\t" + SPL.split("\n").join("\n\t") + "\n}\nYou are now the " + splName + " defined above, please complete the user interaction as required.";
    
    return SPL;
};

