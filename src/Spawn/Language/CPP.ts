import path from "path";
import { getConfig } from "../../Config";
import { JailBindMountOption } from "../Jail";
import { RunOption, Language, LanguageConfigureOption, ExecType } from "./decl";

export class CPP extends Language {
    private src = "src.cpp";
    private bin = "src";

    constructor(option: LanguageConfigureOption) {
        super(option);
    }

    get compileCacheable(): boolean {
        return true;
    }

    get srcFileName(): string {
        return this.src;
    }

    compileOptionGenerator(): RunOption {
        const compilerOptions: string[] = [
            this.src,
            "-o",
            this.bin,
            this.excutable.environment.options?.version !== undefined
                ? `--std=${this.excutable.environment.options.version}`
                : "--std=c++17",
        ];
        if (this.excutable.environment.options?.o2 === false) {
            compilerOptions.push("-O0");
        } else {
            compilerOptions.push("-O2");
        }
        if (this.excutable.environment.options?.static) {
            compilerOptions.push("-static");
        }
        if (this.excutable.environment.options?.lm) {
            compilerOptions.push("-lm");
        }
        const bindMount: JailBindMountOption[] = [];
        if (
            this.execType === ExecType.Spj ||
            this.execType === ExecType.Interactor
        ) {
            bindMount.push({
                source: getConfig().language.testlib,
                dest: path.join(this.compileDir, "testlib.h"),
                mode: "ro",
            });
        }
        return {
            skip: false,
            command: getConfig().language.cpp,
            args: compilerOptions,
            jailSpawnOption: {
                bindMount: bindMount,
            },
        };
    }

    execOptionGenerator(): RunOption {
        const binPath = path.join(this.compileDir, this.bin);
        return {
            skip: false,
            command: binPath,
            spawnOption: {},
            jailSpawnOption: {
                bindMount: [
                    {
                        source: binPath,
                        mode: "ro",
                    },
                ],
            },
        };
    }
}
