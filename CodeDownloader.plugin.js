/**
 * @name CodeDownloader
 * @version 1.0.1
 * @description CodeDownloader
 * @author picocode 
*/

var debug = true;
var removechar
module.exports = (_ => {
	const config = {
		"info": {
			"name": "CodeDownloader",
			"author": "picocode",
			"version": "1.0.1",
			"description": "Downloads code to specific location"
		},
		"changeLog": {
			"improved": {
				"Quick Action": "Added more checks"
			}
		}
	};

	//Checking for BDFDB LIB
	return (false) ? class { } : !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName() { return config.info.name }
		getAuthor() { return config.info.author; }
		getVersion() { return config.info.version; }
		getDescription() { return `The Library Plugin needed for ${config.info.name} is missing. Open the Plugin Settings to download it. \n\n${config.info.description}`; }

		downloadLibrary() {
			require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
				if (!e && b && r.statusCode == 200) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.showToast("Finished downloading BDFDB Library", {
					type: "success"
				}));
				else BdApi.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
			});
		}

		start() {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {
				pluginQueue: []
			});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => { delete window.BDFDB_Global.downloadModal},
					
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						this.downloadLibrary();
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
		}
		
		stop() { }
		getSettingsPanel() {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${config.info.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
			return template.content.firstElementChild;
		}
		//Checking for BDFDB LIB
	} : (([Plugin, BDFDB]) => {

		//Plugin code
		return class CodeDownloader extends Plugin {
			onLoad() { if (debug) console.clear() }
			onStart() { if (debug) console.log("Starting CodeDownloader") }
			onStop() { if (debug) console.log("Stopping CodeDownloader") }


			onMessageContextMenu(e) {
				let message = [e.instance.props.message.content, BDFDB.ArrayUtils.is(e.instance.props.message.attachments) && e.instance.props.message.attachments.map(n => n.url)].flat(10).filter(n => n).join("\n");
				if (message.startsWith('```') && message.endsWith('```')) {
					let selectedText = document.getSelection().toString().trim();
					if (selectedText) message = BDFDB.StringUtils.extractSelection(message, selectedText);
					let entries = [ message && BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: "Download code",
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "copy-message"),
							action: _ => {
								var codestyle = message.split('\n')[0].slice(3).replaceAll("+", "p")

								if (message.slice(codestyle.length + 4, - codestyle.length).slice(-1) == '`') removechar = 1;
								else
								removechar = 0

								var actual_code = message.slice(codestyle.length + 4, - codestyle.length - removechar)
					
								if (debug) {
									console.log(`Language: ${codestyle}${actual_code}`)
								}

								var Download = document.createElement("a");
								Download.setAttribute("download", "code." + codestyle);
								Download.setAttribute("href", "data:text/csv," + actual_code);
								document.body.appendChild(Download);
								Download.click();					
							}
						}),
					].filter(n => n);
					if (entries.length) {
						let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {
							id: "devmode-copy-id",
							group: true
						});
						children.splice(index > -1 ? index : children.length, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
							children: entries
						}));
					}
				}
			}

			onMessageOptionContextMenu(e) {
				let message = e.instance.props.message.content
				if (e.instance.props.message && message.startsWith('```') && message.endsWith('```')) {
					let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {
						id: "mark-unread"
					});
					children.splice(index + 1, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: "Download code",
						id: BDFDB.ContextMenuUtils.createItemId(this.name, "copy-message-Format"),
						icon: _ => {
							return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
								className: BDFDB.disCN.menuicon,
								name: BDFDB.LibraryComponents.SvgIcon.Names.GLOBE
							});
						},
						action: _ => {
							var codestyle = message.split('\n')[0].slice(3).replaceAll("+", "p")

							if (message.slice(codestyle.length + 4, - codestyle.length).slice(-1) == '`') removechar = 1;
							else
							removechar = 0

							var actual_code = message.slice(codestyle.length + 4, - codestyle.length - removechar)
				
							if (debug) {
								console.log(`Language: ${codestyle}${actual_code}`)
							}

							var Download = document.createElement("a");
							Download.setAttribute("download", "code." + codestyle);
							Download.setAttribute("href", "data:text/csv," + actual_code);
							document.body.appendChild(Download);
							Download.click();							
						}
					}));
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();
