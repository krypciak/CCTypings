import * as estree from 'estree'

export class Namespace {
    public name: string
    public classes: Class[] = []
    public namespaces: Namespace[] = []
    public unionTypes: UnionTypeMeta[] = []

    public constructor(name: string) {
        this.name = name
    }

    public copy(): Namespace {
        const obj = new Namespace(this.name)
        obj.classes = this.classes.map(o => o.copy())
        obj.namespaces = this.namespaces.map(o => o.copy())
        obj.unionTypes = this.unionTypes.map(o => o.copy())
        return obj
    }
}

export class Class {
    public name: string
    public module?: string

    public assignNode?: estree.AssignmentExpression
    public parentName?: string[]
    public parent?: Class

    public properties = new Map<string, estree.Node>()
    public fields: FieldMeta[] = []
    public functions: FunctionMeta[] = []
    public ctor?: FunctionMeta

    public constructor(name: string) {
        this.name = name
    }

    public copy(): Class {
        const obj = new Class(this.name)
        obj.module = this.module
        obj.assignNode = this.assignNode
        obj.parentName = this.parentName
        obj.parent = this.parent
        obj.properties = this.properties
        obj.fields = this.fields
        obj.functions = this.functions
        obj.ctor = this.ctor
        return obj
    }
}

export class FieldMeta {
    public readonly name: string
    public readonly initSrc: estree.Node

    public type?: string

    public constructor(name: string, initSrc: estree.Node) {
        this.name = name
        this.initSrc = initSrc
    }

    public copy(): FieldMeta {
        const obj = new FieldMeta(this.name, this.initSrc)
        obj.type = this.type
        return obj
    }
}

export class FunctionMeta {
    public readonly name: string
    public argNames: string[] = []
    public readonly src: estree.FunctionExpression

    public returnType?: string

    public constructor(name: string, src: estree.FunctionExpression) {
        this.name = name
        this.src = src
    }

    public copy(): FunctionMeta {
        const obj = new FunctionMeta(this.name, this.src)
        obj.argNames = this.argNames
        obj.returnType = this.returnType
        return obj
    }
}

export class UnionTypeMeta {
    public readonly name: string
    public readonly types: string[]

    public constructor(name: string, types: string[]) {
        this.name = name
        this.types = types
    }

    public copy(): UnionTypeMeta {
        return new UnionTypeMeta(this.name, this.types)
    }
}
