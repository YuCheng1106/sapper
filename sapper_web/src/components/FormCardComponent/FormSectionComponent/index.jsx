import ExampleSection from "./ExampleSection";
import NameSection from "./NameSection";
import ButtonSection from "./ButtonSection";
import GenericContentSection from "./GenericContentSection";
import GenericMultipleSection from "./GenericMultipleSection";
// import BackgroundKnowledgeSection from "./BackgroundKnowledgeSection";
const FormSectionComponent = {
  Terms: GenericMultipleSection,
  Rules: GenericMultipleSection,
  Description: GenericContentSection,
  Commands: GenericMultipleSection,
  Comment: GenericContentSection,
  InputVariable: GenericContentSection,
  OutputVariable: GenericContentSection,
  Example: ExampleSection,
  Format: GenericContentSection,
  Name: NameSection,
  Button: ButtonSection,
  BackgroundKnowledge: GenericContentSection,
  // 添加更多组件类型映射...
};

export default FormSectionComponent;
