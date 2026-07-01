/**
 * Registers universal utility blocks shared across all SomMark mappers.
 *
 * @param {Mapper} mapper - The mapper instance to register tags on.
 */
export function registerSharedOutputs(mapper) {
	mapper.register(
		["raw", "Raw"],
		({ content }) => {
			return content;
		},
    {
      escape: false, rules: {
      required_args: ["smark-raw"]
		} }
	);
}
