import { NodeDescription } from './syntaxtree.description'

/**
 * Describes an XML element that may have children or attributes.
 */
export interface XmlElementDescription extends NodeDescription {
  nodeChildren: {
    attributes: XmlAttributeDescription[]
    children: XmlElementDescription[]
  }
}

/**
 * Describes a key-value pair that is an attribute of an XmlElement
 */
export interface XmlAttributeDescription extends NodeDescription {
  nodeProperties: {
    name: string
    value: string
  }
}
