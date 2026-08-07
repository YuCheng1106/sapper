import {
  FileTextOutlined,
  CommentOutlined,
  TableOutlined,
  CodeOutlined,
  SettingOutlined,
  IdcardOutlined,
  InfoCircleOutlined,
  LockOutlined,
  ToolOutlined,
  // ...其他需要的图标
} from '@ant-design/icons';

export const SectionIcon = {
  Name: () => <FileTextOutlined />,
  Comment: () => <CommentOutlined />,
  Rules: () => <FileTextOutlined />,
  Terms: () => <TableOutlined />,
  Description: () => <FileTextOutlined />,
  BackgroundKnowledge: () => <FileTextOutlined />,
  Format: () => <CodeOutlined />,
  Commands: () => <IdcardOutlined />,
  Example: () => <IdcardOutlined />,
  InputVariable: () => <IdcardOutlined />,
  OutputVariable: () => <IdcardOutlined />,
  Priming: () => <SettingOutlined />,
  Audience: () => <IdcardOutlined />,
  Terminology: () => <InfoCircleOutlined />,
  Metadata: () => <InfoCircleOutlined />,
  Persona: () => <IdcardOutlined />,
  Constraint: () => <SettingOutlined />,
  ContextControl: () => <SettingOutlined />,
  Instruction: () => <ToolOutlined />,
  Guardrails: () => <LockOutlined />,
  // ...其他图标映射
};


export const SPLFormDefaultValue = {
  Priming: {
    Rules: "",
    Terms: "",
    Description: "",
  },
  ContextControl: {
    Rules: [""],
  },
  Constraint: {
    Rules: [""],
  },
  Context: {
    BackgroundKnowledge: "",
    Rules: ['']
  },
  Audience: {
    Description: "",
  },
  Persona: {
    Description: "",
  },
  Terminology: {
    Terms: [""],
    Rules: [""]
  },
  Instruction: {
    Commands: [""],
    Name: "",
    InputVariable: "~refParameter{UserRequest}/refParameter",
    OutputVariable: "",
    Rules: [""],
    Format: "",
    Example: { "input": '\n', "output": '\n' },
  },
};

export const InitSectionValue = [
  {
    type: 'Persona',
    initialState: () => ({
      sectionId: Date.now().toString(),
      sectionType: 'Persona',
      section: [{subSectionId: "S1" + Date.now().toString(), subSectionType: 'Description', content: ''}]
    })
  },
  {
    type: 'Audience',
    initialState: () => ({
      sectionId: Date.now().toString(),
      sectionType: 'Audience',
      section: [{subSectionId: "S1" + Date.now().toString(), subSectionType: 'Description', content: ''}]
    })
  },
  {
    type: 'Terminology',
    initialState: () => ({
      sectionId: Date.now().toString(),
      sectionType: 'Terminology',
      section: [{subSectionId: "S1" + Date.now().toString(), subSectionType: 'Terms', content: ['']}]
    })
  },
  {
    type: 'Context',
    initialState: () => ({
      sectionId: Date.now().toString(),
      sectionType: 'Context',
      section: [{subSectionId: "S1" + Date.now().toString(), subSectionType: 'BackgroundKnowledge', content: ""}]
    })
  },
  {
    type: 'Constraint',
    initialState: () => ({
      sectionId: Date.now().toString(),
      sectionType: 'Constraint',
      section: [{subSectionId: "S1" + Date.now().toString(), subSectionType: 'Rules', content: ['']}]
    })
  },
  {
    type: 'Instruction',
    initialState: () => ({
      sectionId: Date.now().toString(),
      sectionType: 'Instruction',
      section: [
        {subSectionId: "S1" + Date.now().toString(), subSectionType: 'Name', content: ''},
        {subSectionId: "S2" + Date.now().toString(), subSectionType: 'InputVariable', content: '~refParameter{UserRequest}/refParameter'},
        {subSectionId: "S3" + Date.now().toString(), subSectionType: 'Commands', content: ['']},
        {subSectionId: "S4" + Date.now().toString(), subSectionType: 'OutputVariable', content: '~refParameter{Output1}/refParameter'}
      ]
    })
  }
];

export const SectionDescription = {
  Name: "",
  InputVariable: "",
  OutputVariable: "",
  Comment: "",
  Rules: "",
  Terms: "",
  Description: "",
  Format: "",
  "Output Format": "",
  Commands: "",
  Example: '',
  Priming: "",
  Audience: "",
  Terminology: "",
  Metadata: "",
  Persona: "",
  Constraint: "",
  ContextControl: "",
  BackgroundKnowledge: "",
  Instruction: "",
  Guardrails: "",
  Topical: "",
  Factuality: "",
  PII: "",
};

export const SectionDescriptionTran = {
  Name: "名称",
  InputVariable: "输入项",
  OutputVariable: "输出项",
  Comment: "备注",
  Rules: "规则",
  Terms: "术语解释",
  Description: "详细描述",
  Format: "格式要求",
  "Output Format": "输出格式",
  Commands: "操作指令",
  Example: '示例说明',
  Priming: "准备阶段",
  Audience: "目标受众",
  Terminology: "专业术语",
  Metadata: "数据描述",
  Persona: "角色设定",
  Constraint: "约束条件",
  ContextControl: "全局控制",
  Context: "情境说明",
  BackgroundKnowledge: "背景知识",
  Instruction: "操作步骤",
  Guardrails: "防护措施",
  Topical: "话题相关",
  Factuality: "真实性",
  PII: "隐私信息",
};


export const mapTypeToColor = (type) => {
  const colorMap = {
    Persona: "#FF6347", // Tomato color for 'Persona'
    Audience: "#4682B4", // SteelBlue color for 'Audience'
    Constraint: "#32CD32", // LimeGreen color for 'Constraint'
    ContextControl: "#32CD32", // LimeGreen color for 'Constraint'
    Context: "#32CD32", // LimeGreen color for 'Constraint'
    Instruction: "#a38a00", // Gold color for 'Instruction'
    Terminology: "#6A5ACD", // SlateBlue color for 'Terminology'
    Guardrails: "#FF69B4", // HotPink color for 'Guardrails'
  };

  return colorMap[type] || "black"; // Default color if type not found
};

export const StatusEnum = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "inprogress",
  DONE: "done",
};
