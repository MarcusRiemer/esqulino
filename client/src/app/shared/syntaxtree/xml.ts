import { Node, NodeDescription } from './syntaxtree'
import { XmlElementDescription, XmlAttributeDescription } from './xml.description'

class XmlElementNode extends Node {
  constructor(desc: NodeDescription, parent: Node) {
    super(desc, parent);
  }

  get attributes(): XmlAttributeNode[] {
    return (this.nodeChildren['attributes'] as XmlAttributeNode[])
  }

  get children(): XmlElementNode[] {
    return (this.nodeChildren['children'] as XmlElementNode[])
  }
}

class XmlAttributeNode extends Node {
  constructor(desc: NodeDescription, parent: Node) {
    super(desc, parent);
  }

  get name(): string {
    return (this.nodeProperties['name']);
  }

  get value(): string {
    return (this.nodeProperties['value']);
  }
}
