import { Finder } from '../pass'
import { Namespace, Class } from '../type'
import * as estree from 'estree'
import * as estraverse from 'estraverse'

export class ClassFinder extends Finder {
    private knownNamespaces: Namespace[] = []

    public find(ast: estree.Program, context: Namespace): void {
        const defs = this.findClassDefs(ast)
        for (const def of defs) {
            this.buildStructure(def)
        }
        context.namespaces.push(...this.knownNamespaces)
    }

    private findClassDefs(ast: estree.Program): { module: string; node: estree.AssignmentExpression }[] {
        const result: { module: string; node: estree.AssignmentExpression }[] = []

        let module: string = ''
        estraverse.traverse(ast, {
            enter: (node): void => {
                if (
                    node.type == 'CallExpression' &&
                    node.callee.type == 'MemberExpression' &&
                    node.callee.object.type == 'Identifier' &&
                    node.callee.object.name == 'ig' &&
                    node.callee.property.type == 'Identifier' &&
                    node.callee.property.name == 'module' &&
                    node.arguments.length == 1 &&
                    node.arguments[0].type == 'Literal'
                ) {
                    module = node.arguments[0].value as string
                }
                if (
                    node.type === 'AssignmentExpression' &&
                    node.right.type === 'CallExpression' &&
                    node.right.callee.type === 'MemberExpression' &&
                    node.right.callee.property.type === 'Identifier' &&
                    node.right.callee.property.name === 'extend'
                ) {
                    if (
                        node.left.type === 'MemberExpression' &&
                        node.left.computed &&
                        node.left.property.type === 'Literal' &&
                        typeof node.left.property.value === 'number'
                    ) {
                        return
                    }

                    result.push({ module, node })
                }
                if (
                    node.type === 'AssignmentExpression' &&
                    node.right.type === 'AssignmentExpression' &&
                    node.right.right.type === 'CallExpression' &&
                    node.right.right.callee.type === 'MemberExpression' &&
                    node.right.right.callee.property.type === 'Identifier' &&
                    node.right.right.callee.property.name === 'extend'
                ) {
                    result.push({ module, node })
                }
            },
        })

        return result
    }

    private buildStructure(obj: { module: string; node: estree.AssignmentExpression }): void {
        const def = obj.node
        const className = this.getName(def.left)
        const parentName = this.getName(def.right)

        if (className.length <= 1) {
            return
        }

        let current!: Namespace
        let node = this.knownNamespaces
        for (const name of className.slice(0, className.length - 1)) {
            const existing = node.find((n): boolean => n.name === name)
            if (existing) {
                current = existing
            } else {
                current = new Namespace(name)
                node.push(current)
            }
            node = current.namespaces
        }

        const newClass = new Class(className[className.length - 1])
        newClass.module = obj.module
        newClass.assignNode = def.right.type !== 'AssignmentExpression' ? def : def.right
        newClass.parentName = parentName
        current.classes.push(newClass)
    }

    private getName(node: estree.Node): string[] {
        switch (node.type) {
            case 'Identifier':
                return [node.name]
            case 'MemberExpression':
                if (node.computed && node.object.type !== 'Literal') {
                    return []
                }

                return [...this.getName(node.object), ...this.getName(node.property)]
            case 'CallExpression':
                const callResult = this.getName(node.callee)
                return callResult.slice(0, callResult.length - 1)
            case 'AssignmentExpression':
                return this.getName(node.right)
            case 'Literal':
                return []
            default:
                debugger
                return []
        }
    }
}
