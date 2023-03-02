import { createWriteStream } from "fs"
import { Readable } from "stream"
import { streamPlantUml } from "./plantuml"
import { OutputFormat, outputFormats, OutputOptions } from "./types/tx2umlTypes"

const debug = require("debug")("tx2uml")

export const generateFile = async (
    pumlStream: Readable,
    options: OutputOptions = {}
) => {
    const filename = constructFilename(options.filename, options.format)
    try {
        const outputStream = createWriteStream(filename)
        if (options.format === "puml") {
            pumlStream.pipe(outputStream)
            debug(`Plant UML file written to ${filename} in raw puml format`)
        } else if (outputFormats.includes(options.format)) {
            await streamPlantUml(pumlStream, outputStream, {
                format: options.format,
                limitSize: 60000,
            })
            debug(
                `Plant UML file written to ${filename} in ${options.format} format.`
            )
        } else {
            throw new Error(
                `Output format ${options.format} is not supported. Only the following formats are supported: ${outputFormats}.`
            )
        }
    } catch (err) {
        throw new Error(`Failed to write to file ${filename}.`, { cause: err })
    }
}

const constructFilename = (filename: string, format: OutputFormat = "png") => {
    if (!filename || filename === "") {
        return `output.${format}`
    }
    const fileExtension = filename.slice(-4)
    if (["puml", ".png", ".svg", ".eps"].includes(fileExtension)) {
        return filename
    }

    return filename + "." + format
}
