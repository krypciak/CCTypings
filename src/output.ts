import * as fs from 'fs'
import { Namespace, Class, FunctionMeta, FieldMeta, UnionTypeMeta } from './type'

export class Formatter {
    private stream!: fs.WriteStream

    public print(name: string, context: Namespace): void {
        this.stream = fs.createWriteStream(name)

        this.write('export {};\ndeclare global {\n')
        for (const ns of context.namespaces) {
            this.namespace(ns, 1)
        }
        this.write('}')
        this.stream.close()
    }

    private write(text: string): void {
        this.stream.write(text)
    }

    private indent(level: number): void {
        this.write('    '.repeat(level))
    }

    private declareOrExport(level: number): void {
        this.indent(level)
        if (level === 0) {
            this.write('declare ')
        } else {
            this.write('export ')
        }
    }

    private namespace(ns: Namespace, level: number): void {
        this.indent(level)
        // this.declareOrExport(level)
        this.write(`namespace ${ns.name} {\n`)

        for (const namespace of ns.namespaces) {
            this.namespace(namespace, level + 1)
        }

        for (const clazz of ns.classes) {
            this.clazz(clazz, level + 1)
        }

        for (const unionType of ns.unionTypes) {
            this.unionType(unionType, level + 1)
        }

        this.indent(level)
        this.write('}\n')
    }

    private clazz(clazz: Class, level: number): void {
        this.indent(level)
        this.write(`/* ${clazz.module} */\n`)
        this.indent(level)
        // this.declareOrExport(level)
        this.write(`interface ${clazz.name} `)
        if (clazz.parent !== clazz && clazz.parentName) {
            this.write(`extends ${clazz.parentName.join('.')} `)
        }
        this.write('{\n')

        for (const field of clazz.fields) {
            this.field(field, level + 1)
        }
        if (clazz.fields.length > 0) {
            this.write('\n')
        }
        for (const func of clazz.functions) {
            this.function(func, level + 1)
        }

        this.indent(level)
        this.write('}\n')
        if (clazz.ctor) {
            this.ctor(clazz, level)
            this.write('\n')
        }
    }

    private ctor(clazz: Class, level: number): void {
        this.indent(level)
        const constructorName = `${clazz.name}Constructor`
        this.write(`interface ${constructorName} extends ImpactClass<${clazz.name}> {\n`)
        this.indent(level + 1)
        this.write(
            `new (${clazz
                .ctor!.argNames.filter((n): boolean => !n.startsWith('_usedInChild'))
                .map((n): string => n + ': unknown')
                .join(', ')}): ${clazz.name};\n`
        )
        this.indent(level)
        this.write(`}\n`)
        this.indent(level)
        this.write(`var ${clazz.name}: ${constructorName}\n`)
    }

    private function(func: FunctionMeta, level: number): void {
        if (func.name == 'init') return
        this.indent(level)
        this.write(`${func.name}(`)
        this.write(['this', ...func.argNames].map((n): string => n + `: ${n == 'this' ? 'this' : 'unknown'}`).join(', '))
        this.write(`): ${func.returnType || 'unknown'};\n`)
    }

    private field(field: FieldMeta, level: number): void {
        this.indent(level)
        this.write(`${field.name}: ${field.type || 'unknown'};\n`)
    }

    private unionType(unionType: UnionTypeMeta, level: number): void {
        this.declareOrExport(level)
        this.write(`let ${unionType.name}: typeof ${unionType.types.join(' | typeof ')};\n`)
    }
}
