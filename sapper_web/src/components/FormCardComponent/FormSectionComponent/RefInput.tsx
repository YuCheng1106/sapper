import {createEditor, Editor, Transforms} from 'slate';
import { Editable, Slate, withReact} from 'slate-react';
import { useCallback, useEffect, useState } from 'react';
import { css } from '@emotion/css';
import { RenderRefAPI, RenderRefData, RenderRefParam, RenderRefVar } from './RenderRefComponent';
import { Popover } from 'antd';
import {RenderElementProps} from "slate-react/dist/components/editable";
import {useDispatchGlobalState} from "../../../hooks/global.ts";


const REF_DATA_TYPE = 'ref-data';
const REF_API_TYPE = 'ref-api';
const REF_PARAM_TYPE = 'ref-param';

type CustomText = { text: string };

type CustomElement = {
    type: 'paragraph';
    children: (CustomText | CustomRefElement)[]
};

type CustomRefElement = {
    type: typeof REF_DATA_TYPE | typeof REF_API_TYPE | typeof REF_PARAM_TYPE;
    content: string
    children: [{ text: '' }]
};



// Serializer
type SerializeNode = CustomElement | CustomText | CustomRefElement;

const serialize = (nodes: SerializeNode[]): string => {
    return nodes.map((node: SerializeNode): string => {
        if ('type' in node && [REF_DATA_TYPE, REF_API_TYPE, REF_PARAM_TYPE].includes(node.type)) {
            // Type guard for CustomRefElement
            const refNode = node as CustomRefElement;
            return `${refNode.content}`; // Note: You'll need to add 'content' to CustomRefElement type
        }

        if ('children' in node) {
            // Type guard for CustomElement
            const elementNode = node as CustomElement;
            return elementNode.children.map((child: CustomText | CustomRefElement): string => {
                if ('type' in child && [REF_DATA_TYPE, REF_API_TYPE, REF_PARAM_TYPE].includes(child.type)) {
                    const refChild = child as CustomRefElement;
                    return `${refChild.content}`;
                }
                const childNode = child as CustomText;
                return childNode.text;
            }).join('');
        }

        // Default case for CustomText
        return node.text;
    }).join('\n');
};

// Deserializer with better error handling
const deserialize = (content: string): CustomElement[] => {
    try {
        const all_content = content.split('\n');
        const paragraphs: CustomElement[] = []; // Explicitly type as CustomElement[]

        for (const content of all_content) {
            const nodes: (CustomText | CustomRefElement)[] = [];
            const pattern = /(~refData\{.*?\}.*?\/refData|~refParameter\{.*?\}\/refParameter|~refAPI\{.*?\}.*?\/refAPI|\$.*?\$)/g;
            const parts = content.split(pattern).filter(part => part && part.trim() !== '');

            parts.forEach(part => {
                const refDataMatch = part.match(/~refData\{(.*?)\}(.*?)\/refData/);
                if (refDataMatch) {
                    nodes.push({text: ''})
                    nodes.push({
                        type: REF_DATA_TYPE,
                        content: part,
                        children: [{ text: '' }]
                    } as CustomRefElement); // Explicit cast
                    nodes.push({text: ''})
                    return;
                }

                const refAPIMatch = part.match(/~refAPI\{(.*?)\}(.*?)\/refAPI/);
                if (refAPIMatch) {
                    nodes.push({text: ''})
                    nodes.push({
                        type: REF_API_TYPE,
                        content: part,
                        children: [{ text: '' }]
                    } as CustomRefElement); // Explicit cast
                    nodes.push({text: ''})
                    return;
                }

                const refParamMatch = part.match(/~refParameter\{.*?\}\/refParameter/);
                if (refParamMatch) {
                    nodes.push({text: ''})
                    nodes.push({
                        type: REF_PARAM_TYPE,
                        content: part,
                        children: [{ text: '' }]
                    } as CustomRefElement); // Explicit cast
                    nodes.push({text: ''})
                    return;
                }
                nodes.push({ text: part } as CustomText);
            });
            if(nodes.length > 0)
                paragraphs.push({
                    type: 'paragraph', // This must be exactly 'paragraph'
                    children: nodes
                });
        }

        return paragraphs.length > 0 ? paragraphs : [{
            type: 'paragraph',
            children: [{ text: '' }]
        }];
    } catch (error) {
        console.error('Deserialization error:', error);
        return [{
            type: 'paragraph',
            children: [{ text: '' }]
        }];
    }
};

// Editor operations with better type safety
const CustomEditor = {
    insertInlineElement(
        editor: Editor,
        type: typeof REF_DATA_TYPE | typeof REF_API_TYPE | typeof REF_PARAM_TYPE,
        value: string,
        changeSelectedVariable: (props: {type: string, data: string}) => void
    ): void {
        const refTag: CustomRefElement = {
            type,
            content: value,
            children: [{ text: '' }],
        };
        const { selection } = editor;
        if (!selection) return;

        try {
            // Using Transforms.select to ensure we have the correct selection
            Transforms.select(editor, selection);

            // Insert space before if needed
            Transforms.insertNodes(editor, { text: ' ' }, {
                at: selection.focus,
            });

            // Insert the reference tag
            Transforms.insertNodes(editor, refTag);

            // Insert space after if needed
            Transforms.insertNodes(editor, { text: ' ' }, {
                at: Editor.after(editor, selection),
            });

            // Move selection after the inserted elements
            Transforms.move(editor, { distance: 1, unit: 'offset' });


            changeSelectedVariable({type: type, data: value})
        } catch (error) {
            console.error('Failed to insert inline element:', error);
        }
    },
};

// Element Components
const DataElement = ({ element, attributes}: RenderElementProps) => {
    return (
        <span
            {...attributes}
            contentEditable={false}
            style={{
                display: 'inline-block',
                verticalAlign: 'middle'
            }}
        >
            <RenderRefData text={element.content} onChange={() => {}} />
        </span>
    );
};

const ApiElement = ({ element, attributes}: RenderElementProps) => {
    return (
        <span
            {...attributes}
            contentEditable={false}
            style={{
                display: 'inline-block',
                verticalAlign: 'middle'
            }}
        >
            <RenderRefAPI text={element.content} onChange={() => {}} />
        </span>
    );
};

const ParamElement = ({ element, attributes}: RenderElementProps) => {
    return (
        <span
            {...attributes}
            contentEditable={false}
            style={{
                display: 'inline-block',
                verticalAlign: 'middle'
            }}
        >
            <RenderRefParam text={element.content} onChange={() => {}} />
        </span>
    );
};

const DefaultElement = ({ attributes, children }: RenderElementProps) => {
    return (
        <p
            {...attributes}
            className={css`
                margin: 0 0 2px 0;
                line-height: 1.5;
            `}
        >
            {children}
        </p>
    );
};

const renderElement = (props: RenderElementProps) => {
    switch (props.element.type) {
        case REF_DATA_TYPE:
            return <DataElement {...props} />;
        case REF_API_TYPE:
            return <ApiElement {...props} />;
        case REF_PARAM_TYPE:
            return <ParamElement {...props} />;
        default:
            return <DefaultElement {...props} />;
    }
}

// Main Editor Component
const RefSlateInput = ({
                           value = '',
                           onChange,
                           active = false,
                       }: {
    value?: string;
    onChange?: (value: string) => void;
    active?: boolean;
}) => {
    const [editor] = useState(() => {
        const editor = withReact(createEditor());

        // 修正后的编辑器扩展
        const { isVoid, isInline } = editor;
        editor.isVoid = element => {
            return [REF_DATA_TYPE, REF_API_TYPE, REF_PARAM_TYPE].includes(element.type || '') ? true : isVoid(element);
        };

        editor.isInline = element => {
            return [REF_DATA_TYPE, REF_API_TYPE, REF_PARAM_TYPE].includes(element.type || '') ? true : isInline(element);
        };

        return editor;
    });

    const [showMenu, setShowMenu] = useState(false);
    const [lastValue, setLastValue] = useState(value);
    const { changeSelectedVariable } = useDispatchGlobalState();
    // 同步外部value变化到编辑器
    useEffect(() => {
        if (value !== lastValue) {
            // 防抖处理
            const timer = setTimeout(() => {
                try {
                    // 清空编辑器
                    Transforms.delete(editor, {
                        at: {
                            anchor: Editor.start(editor, []),
                            focus: Editor.end(editor, []),
                        },
                    });

                    // 插入新内容
                    const parsedValue = deserialize(value);
                    parsedValue.forEach(node => {
                        Transforms.insertNodes(editor, node);
                    });

                    setLastValue(value);
                } catch (error) {
                    console.error('更新编辑器内容失败:', error);
                }
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [value, editor, lastValue]);

    useEffect(() => {
        setShowMenu(false);
    }, [active]);

    const handleMenuSelect = useCallback((value: string, type?: string) => {
        CustomEditor.insertInlineElement(
            editor,
            type as typeof REF_DATA_TYPE | typeof REF_API_TYPE | typeof REF_PARAM_TYPE,
            value,
            changeSelectedVariable
        );
        setShowMenu(false);
    }, [editor]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
        if (event.key === '/' && !showMenu) {
            event.preventDefault();
            setShowMenu(true);
            return;
        }
        if (event.key === 'Escape' && showMenu) {
            setShowMenu(false);
            return;
        }

        // 处理删除键
        if (event.key === 'Backspace' || event.key === 'Delete') {
            const { selection } = editor;
            if (!selection) return;

            const [node] = Editor.node(editor, selection.focus.path);

            // 如果是自定义元素，阻止默认删除行为
            if ([REF_DATA_TYPE, REF_API_TYPE, REF_PARAM_TYPE].includes(node.type)) {
                event.preventDefault();
                return;
            }
        }
    }, [showMenu, editor]);

    const handleValueChange = useCallback((value: CustomElement[]) => {
        const serializedValue = serialize(value);
        if (serializedValue !== undefined && serializedValue !== lastValue) {
            onChange?.(serializedValue);
            setLastValue(serializedValue);
        }
    }, [onChange, lastValue]);

    return (
        <div
            className={css`
                border: ${active ? '1px solid #d9d9d9' : '1px solid transparent'};
                border-radius: 4px;
                width: 100%;
                padding: ${active ? '8px' : '0'};
                background: ${active ? '#f8f8f8' : 'white'};
                transition: all 0.3s;
            `}
        >
            <Slate
                editor={editor}
                initialValue={deserialize(value)}
                onChange={handleValueChange}
            >
                <Editable
                    renderElement={renderElement}
                    onKeyDown={handleKeyDown}
                    placeholder="Type '/' to insert references..."
                    className={css`
                        font-size: 14px;
                    `}
                />
                {showMenu && (
                    <Popover
                        content={
                            <RenderRefVar
                                onChange={handleMenuSelect}
                                text={''}/>
                        }

                        open={showMenu}
                        placement="bottomLeft"
                    />
                )}
            </Slate>
        </div>
    );
};

export default RefSlateInput;