export { default as RenderRefAPI } from './RenderAPI.tsx';
export { default as RenderRefData } from './RenderData.tsx';
export { default as RenderRefParam} from './RenderParam.tsx';
export { default as RenderRefVar} from './RenderVariable.tsx';

export interface RefActionProps {
    text: string;
    onChange: (value: string, type?: string) => void;
}