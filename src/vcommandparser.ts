import OptionPrefix from './@types/OptionPrefix';
import MessageOption from './message-option';
import { extractOptionsFromParsedContent, ParsedMessage, parseMessage } from './message-parser';
import OptionDef from './option-def';

export { VCommandParser };

export default class VCommandParser {
	static readonly DEFAULT_COMMAND_PREFIX = '!';
	static readonly DEFAULT_OPTION_PREFIX = '-';
	
	static parseLazy(message: string, commandPrefix = VCommandParser.DEFAULT_COMMAND_PREFIX, optionPrefix: OptionPrefix = VCommandParser.DEFAULT_OPTION_PREFIX): VLazyParsedCommand {
		const parsedMessage = parseMessage(message, commandPrefix, optionPrefix, undefined, true);
		
		return new VLazyParsedCommand(message, commandPrefix, optionPrefix, parsedMessage);
	}
	
	static parse(message: string, commandPrefix = VCommandParser.DEFAULT_COMMAND_PREFIX, optionPrefix: OptionPrefix = VCommandParser.DEFAULT_OPTION_PREFIX, optionDefinitions?: OptionDef[]): VParsedCommand {
		const parsedMessage = parseMessage(message, commandPrefix, optionPrefix, optionDefinitions);
		
		return new VParsedCommand(message, commandPrefix, optionPrefix, parsedMessage, optionDefinitions);
	}
}

export class VParsedCommand {
	readonly isCommand: boolean;
	
	readonly message: string;
	
	readonly command?: string;
	readonly content?: string;
	
	readonly commandPrefix: string;
	readonly optionPrefix: OptionPrefix;
	
	readonly optionDefinitions?: OptionDef[];
	
	readonly options?: MessageOption[];
	readonly duplicatedOptions?: MessageOption[];
	readonly fullContent?: string;
	
	constructor(message: string, commandPrefix = VCommandParser.DEFAULT_COMMAND_PREFIX, optionPrefix: OptionPrefix = VCommandParser.DEFAULT_OPTION_PREFIX, parsedMessage: ParsedMessage, optionDefinitions?: OptionDef[]) {
		this.message = message;
		this.commandPrefix = commandPrefix;
		this.optionPrefix = optionPrefix;
		this.optionDefinitions = optionDefinitions;
		
		({
			isCommand: this.isCommand,
			command: this.command,
			content: this.content,
			options: this.options,
			duplicatedOptions: this.duplicatedOptions,
			fullContent: this.fullContent
		} = parsedMessage);
	}
	
	getOption(search: string | number): MessageOption | undefined {
		return this.options?.find(option => {
			if (typeof search == 'string') {
				return option.definition?.calls.includes(search) || option.name == search;
			} else {
				return option.position == search;
			}
		});
	}
	
	setOptionDefinitions(optionDefinitions: OptionDef[]): void {
		this.doExtractOptions(optionDefinitions);
	}
	
	protected doExtractOptions(optionDefinitions?: OptionDef[]): void {
		// If there was already no content, there will surely not be any options in it
		if (this.fullContent) {
			const parsedOptions = extractOptionsFromParsedContent(this.fullContent, this.optionPrefix, optionDefinitions);
			
			({
				content: (this.content as string | undefined),
				options: (this.options as MessageOption[] | undefined),
				duplicatedOptions: (this.duplicatedOptions as MessageOption[] | undefined),
			} = parsedOptions);
		}
	}
}

export class VLazyParsedCommand extends VParsedCommand {
	constructor(message: string, commandPrefix = VCommandParser.DEFAULT_COMMAND_PREFIX, optionPrefix: OptionPrefix = VCommandParser.DEFAULT_OPTION_PREFIX, parsedMessage: ParsedMessage, optionDefinitions?: OptionDef[]) {
		super(message, commandPrefix, optionPrefix, parsedMessage, optionDefinitions);
	}
	
	doParseOptions(): void {
		this.doExtractOptions();
	}
}
