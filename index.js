const Discord = require("discord.js");
const {
  MessageActionRow,
  MessageSelectMenu,
  MessageButton,
  MessageEmbed,
  Client,
  Intents,
} = require("discord.js");
const config = require("./config.json");
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});

const discordChannelAuthID = "981241291784458301";
const discordOdaClanID = "961194963549429821";
const boosterRoleID = "978314842601578547";
const roles = {
  hinin1_0: { lvl: 0, id: "980930897354301490", chatid: "" },
  hinin1_1: { lvl: 1, id: "980447398755184640", chatid: "" },
  hinin1_2: { lvl: 2, id: "980447527591616572", chatid: "" },
  hinin1_3: { lvl: 3, id: "980447588937523221", chatid: "" },
  hinin: { lvl: 4, id: "973246305545641984", chatid: "" },
  shonin: {
    lvl: 5,
    id: "971712502230552626",
    chatid: "978286109635272714",
    color: "#ffffff",
  },
  shokunin: {
    lvl: 6,
    id: "971547768172716032",
    chatid: "972204262006345728",
    color: "#00ffff",
  },
  noka: {
    lvl: 7,
    id: "969701663344558130",
    chatid: "969702669507768392",
    color: "#00ff00",
  },
  samurai: {
    lvl: 8,
    id: "961561497115443250",
    chatid: "969703459983097956",
    color: "#ffff00",
  },
  daimyo: {
    lvl: 9,
    id: "971728564984635442",
    chatid: "972210778801315941",
    color: "#ff9900",
  },
  tenno: {
    lvl: 10,
    id: "961197439979761723",
    chatid: "972211000470286390",
    color: "#ff0000",
  },
};
const adviseChannels = [
  "961195429565988904",
  "971709981260931072",
  "961195756805574666", // oracleCrypto
  "961195720067657728", // oracleNft
  "969703506237866034",
  "976777076512260106",
  "961195506187505674",
  "979077895827894342", // clanHistory
  "981252611875426334", // crypto add 1
  "981252683132436520", // crypto add 2
  "981253254908346388", // nft add 1
  "981253299179253790", // nft add 2
];
const reactableMsg = {
  clanVerify: "981096878659751977",
  clanValues: "981097285775654952",
  clanOrder: "981100589545029642",
  clanRules: "981101874038067210",
};
const authChannels = {
  clanVerify: "973876906250346527",
  clanValues: "973876989926707200",
  clanOrder: "973877161901588510",
  clanRules: "973877261650497556",
};
const ticketChannel = "961207655085506560";
const bulkReactEmoji = [
  "🔥",
  "❤️",
  "🎉",
  "👀",
  "✅",
  "🚀",
  "💯",
  "🍀",
  "💎",
  "👁️",
  "🤩",
  "😎",
  "👊",
  "😊",
  "🙏",
  "💫",
  "💥",
  "⚡",
  "☄️",
  "🐲",
];
const correctWords = ["build", "stay", "improve"];
const userAuth = {};

client.on("ready", () => {
  prepareAuthMessage();
  console.log("Logged in!");
});

client.on("guildMemberUpdate", (oldMember, newMember) => {
  try {
    const newM = newMember.roles.cache;
    const oldM = oldMember.roles.cache;

    if (oldM.size > newM.size) {
      // ------------------ Role removed
      let remRoleId = "";
      oldM.forEach((role) => {
        if (!newM.has(role.id) && isRoleALevel(role.id)) {
          remRoleId = role.id;
        }
      });
      //console.log("se " + getRoleLevel(remRoleId));
      //console.log("< di " + getHigestLevel(newMember.roles));
      if (getRoleLevel(remRoleId) < getHigestLevel(newMember.roles)) return;
      if (remRoleId != "") assignLowerLevel(newMember, remRoleId);
    } else if (oldM.size < newM.size) {
      // ------------------ Role added
      let newRoleId = "";
      newM.forEach((role) => {
        if (!oldM.has(role.id)) {
          newRoleId = role.id;
        }
      });
      if (newRoleId == boosterRoleID) {
        sendBoosterMessage(newMember);
        return;
      }
      if (newRoleId == "") return;
      if (getRoleLevel(newRoleId) < 5 && getHigestLevel(newMember.roles) == 5) {
        removeAllLevelsExcept(newMember, newRoleId);
        return;
      }
      if (getRoleLevel(newRoleId) < 5) {
        removeAllLevelsExcept(newMember, newRoleId);
        return;
      }
      //console.log("se " + getRoleLevel(newRoleId));
      //console.log("< di " + getHigestLevel(newMember.roles));
      if (getRoleLevel(newRoleId) < getHigestLevel(newMember.roles)) {
        removeAllLevelsExcept(newMember, newRoleId);
        return;
      }
      //console.log('new role id lvl [' + getRoleLevel(newRoleId) + ']')
      if (newRoleId != "") {
        removeAllLevelsExcept(newMember, newRoleId);
        sendWelcomeMessage(newMember, newRoleId);
      }
    }
  } catch (e) {
    console.log("error [" + e + "]");
  }
});

client.on("messageCreate", async (message) => {
  // nothing yet
});

client.on("messageReactionAdd", async (reaction, user) => {
  if (reaction.me) return;
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error("Something went wrong when fetching the message:", error);
      return;
    }
  }

  if (reaction.me) return;

  let guild = client.guilds.cache.get(discordOdaClanID);
  //let member = guild.members.cache.get(user.id);

  if (adviseChannels.includes(reaction.message.channelId)) {
    if (reaction.message.createdTimestamp < 1654113600000) return;
    let reactedEmoji = reaction.emoji.name;
    reaction.message.react(reactedEmoji);
    const shuffledEmoji = bulkReactEmoji.sort((a, b) => 0.5 - Math.random());
    shuffledEmoji.forEach(async (e) => await reaction.message.react(e));
    return;
  }

  /*
  let memberHighestLvl = getHigestLevel(member.roles);
  switch (reaction.message.id) {
    case reactableMsg.clanVerify:
      if (memberHighestLvl == roles.hinin1_0.lvl)
        addRole(member, roles.hinin1_1.id);
      break;
    case reactableMsg.clanValues:
      if (memberHighestLvl == roles.hinin1_1.lvl)
        addRole(member, roles.hinin1_2.id);
      break;
    case reactableMsg.clanOrder:
      if (memberHighestLvl == roles.hinin1_2.lvl)
        addRole(member, roles.hinin1_3.id);
      break;
    case reactableMsg.clanRules:
      if (memberHighestLvl == roles.hinin1_3.lvl)
        addRole(member, roles.hinin.id);
      break;
    default:
      // nothing to do
      break;
  }
  */
});

client.on("messageReactionRemove", (reaction, user) => { });

client.on("interactionCreate", async (interaction) => {
  if (interaction.isButton()) {
    const customId = interaction.customId;
    console.log(customId);

    let member = interaction.member;
    let memberHighestLvl = getHigestLevel(member.roles);
    switch (customId) {
      case "buttonStep1":
        if (memberHighestLvl == roles.hinin1_0.lvl) {
          addRole(member, roles.hinin1_1.id);
          interaction.reply({
            content: "Step completed! Now you can move to 🏅 clan-values section!",
            ephemeral: true,
          });
        } else {
          interaction.deferUpdate();
        }
        break;
      case "buttonStep2":
        console.log("test");
        if (memberHighestLvl == roles.hinin1_1.lvl) {
          addRole(member, roles.hinin1_2.id);
          interaction.reply({
            content: "Step completed! Now you can move to 🥋 clan-values section!",
            ephemeral: true,
          });
        } else {
          interaction.deferUpdate();
        }
        break;
      case "buttonStep3":
        if (memberHighestLvl == roles.hinin1_2.lvl) {
          addRole(member, roles.hinin1_3.id);
          interaction.reply({
            content: "Step completed! Now you can move to 📜 clan-rules section!",
            ephemeral: true,
          });
        } else {
          interaction.deferUpdate();
        }
        break;
      case "buttonStep4":
        if (memberHighestLvl == roles.hinin1_3.lvl) {
          addRole(member, roles.hinin.id);
          interaction.reply({
            content: "Step completed! Now you can move to 🔰 authentication section!",
            ephemeral: true,
          });
        } else {
          interaction.deferUpdate();
        }
        break;
      default:
        // nothing to do
        break;
    }
  }

  if (!interaction.isSelectMenu()) return;
  else {
    if (getHigestLevel(interaction.member.roles) != 4) {
      interaction.deferUpdate();
      return;
    }

    let selected =
      interaction != null &&
        interaction.values != null &&
        interaction.values[0] != null
        ? interaction.values[0]
        : "";

    if (userAuth[interaction.user.id] == null) {
      userAuth[interaction.user.id] = [];
    }
    userAuth[interaction.user.id].push(selected);

    const multipleExist = correctWords.every((value) => {
      return userAuth[interaction.user.id].includes(value);
    });
    if (multipleExist) {
      try {
        delete userAuth[interaction.user.id];
      } catch (e) { }
      interaction.reply({
        content: `Let's go ✅ \nYou completed the verification process`,
        ephemeral: true,
      });
      //addRole(interaction.member, roles.shonin.id)
      addRole(interaction.member, roles.shokunin.id);
      return;
    }

    switch (interaction.customId) {
      case "auth_word1":
        interaction.deferUpdate();
        break;
      case "auth_word2":
        interaction.deferUpdate();
        break;
      case "auth_word3":
        interaction.deferUpdate();
        break;
    }
  }
});

client.login(config.token);

/* ------------------------------ UTILS ------------------------------ */

async function prepareAuthMessage() {
  // Verification channels zone
  const channel1 = client.channels.cache.get(authChannels.clanVerify);
  const messages1 = await channel1.messages.fetch({ limit: 1 });
  const channel2 = client.channels.cache.get(authChannels.clanValues);
  const messages2 = await channel2.messages.fetch({ limit: 1 });
  const channel3 = client.channels.cache.get(authChannels.clanOrder);
  const messages3 = await channel3.messages.fetch({ limit: 1 });
  const channel4 = client.channels.cache.get(authChannels.clanRules);
  const messages4 = await channel4.messages.fetch({ limit: 1 });

  const descr = [
    "Hello stranger, before letting you access every section of our server,a task is presented to you.\n\n" +
    "**The following paragraphs will unfold in a path, one after the other, please read them carefully to understand the key concepts " +
    "that guide and inspire this Clan**.\n\nWe are the **ODA CLAN**; we use advanced software that process big data analytics to discover and " +
    "share with you the best Crypto and NFT projects.\n\nIf you are in a hurry, looking for a quick tip on where and how to invest, " +
    "you are in the wrong place.\n\nWe believe in something different; we are building a solid, resilient community. A place where you" +
    " will learn and grow, a place where you will find friends and tutors, where you will be gifted with the final product of our " +
    "team’s insightful work.\n\nWe are at the forefront of the Crypto, DeFi and NFTs industry, we welcome you.\n\n**You will find three mystery " +
    "words, one in each of the next three boxes.**\n\nTake your time to read every box properly, join us in this journey.\n\n**Click the ↩️ BUTTON" +
    " below this message to unlock the path.**",

    "ODA means **Oracle Data Analytics**.\n" +
    "By using software that analyses thousands of projects and \ncryptocurrencies every day, " +
    "we will prove, and have proved many times already, that we are able to understand and " +
    "predict Crypto and NFT cycles before they manifest themselves.\n" +
    "We want to share some of our work with you.\n\n" +
    "These are the founding values of our Clan, make sure you read them well, because anyone " +
    "who falls short on this will be held accountable.\n\n" +
    "**義, gi Righteousness.**\n\n" +
    "Be acutely honest throughout your dealings with all Kyodai.\n" +
    "Believe in justice,\n" +
    "To the true Kyodai, all points of view are deeply considered.\n" +
    "Kyodai make a full commitment to their decisions.\n\n" +
    "**勇, yū Heroic Courage.**\n\n" +
    "Hiding like a turtle in a shell is not living at all.\n" +
    "A true Kyodai must have heroic courage.\n" +
    "It is risky.\n" +
    "It is living your life to the fullest and cherishing the present.\n" +
    "Heroic courage is clever and powerful, it inspires the Kyodai to perceive and conquer the future.\n\n" +
    "**仁, jin Benevolence, Compassion.**\n\n" +
    "Through intense studying and hard work, the true Kyodai becomes conscious and ready.\n" +
    "We are not like most people. We spread a power that must be used for good.\n" +
    "We have compassion. We help other Kyodai at every opportunity.\n\n" +
    "**礼, rei Respect.**\n\n" +
    "True Kyodai have no reason to be cruel. We do not need to prove our strength.\n" +
    "Warriors are not only respected for their strength in battle, but also by their " +
    "dealings with others.\n" +
    "The true strength of a warrior becomes apparent during difficult times.\n\n" +
    "**忠義, chūgi Duty and Loyalty.**\n\n" +
    "Kyodai are responsible for everything that they have done and everything that " +
    "they have said and all the consequences that follow. They are immensely loyal " +
    "to all of those in their care.\n" +
    "To everyone that they are responsible for, they remain fiercely true. \n" +
    "The first mystery word is: _Build_.\n\n" +
    "It is the duty of all Kyodai to report any behaviour that goes against \n" +
    "these values via <#" +
    ticketChannel +
    ">\n\n" +
    "**Click the ↩️ BUTTON below this message to unlock the path.**",

    "We deeply believe in **meritocracy,** and the one who comes last, can’t be at " +
    "the same level as the one who is putting effort and time every day by building " +
    "and developing this community.\nThat’s why the clan will be divided into different roles:\n\n" +
    "• <@&" +
    roles.hinin.id +
    ">" +
    "\nIn our clan, the **Hinin 非人** is the one who did not make the effort to complete " +
    "the authentication process and therefore should not take part in the Clan legacy.\n\n" +
    "• <@&" +
    roles.shonin.id +
    ">" +
    "\nIn our Clan, **Shōnin 商人** is the one who gets authenticated and starts his " +
    "journey into the Clan, understanding its values, learning, and applying tools " +
    "that can be beneficial to him and the ODA community.\n\n" +
    "• <@&" +
    roles.shokunin.id +
    ">" +
    "\nThey stood out from **Shōnin 商人** because they brought value to the clan " +
    "by creating objects useful to others.\n\n" +
    "• <@&" +
    roles.noka.id +
    ">" +
    "\nThey stood out from **Shokunin 職人** because they have actively moderated, " +
    "invited others into the Clan and helped the general development of the ODA " +
    "community more than the previous classes.\n\n" +
    "• <@&" +
    roles.samurai.id +
    ">" +
    "\nThey stood out from **Nōka 農家** because they excelled in one specific task, " +
    "or they financially invested in the Clan, paying a subscription that gives " +
    "them a coordinated profile picture, and more benefits than any other role, " +
    "such as exclusive, early information about alpha projects and the market in general.\n\n" +
    "• <@&" +
    roles.daimyo.id +
    ">" +
    "\nThey stood out from the brave **Samurai 武士**, by being uncontested masters of specific " +
    "areas, even gaining a small following by teaching to the Clan the secrets of their profession.\n\n" +
    "• <@&" +
    roles.tenno.id +
    ">" +
    "\nIn our Clan Ten'nō 天皇 are fully decentralized persons, and we will not disclose " +
    "more information about them.\n" +
    "They make sure the clan grows and is prosperous for years to come. " +
    "The second mystery word is: _Stay._\n\n" +
    "With effort and dedication, by following the Clan’s rules and respecting its " +
    "values, you will be able to climb up the ranks.\n" +
    "Learn more about this on the FAQ section.\n\n" +
    "**Click the ↩️ BUTTON below this message to unlock the path.**",

    "Anyone can **climb the clan rank ladder**.\n" +
    "You will need to bring value to the Clan: inviting people, moderating, " +
    "engaging in daily activities and promoting our community.\n\n" +
    "Anyone can also **lower or permanently lose their rank**: bad attitude, " +
    "words and deeds, and everything that will threaten the positivity and healthy " +
    "environment we are building will be punished.\n\n" +
    "It isn’t smart to work " +
    "hard to upgrade your position and then lower it by spreading negativity or FUD, " +
    "so be respectful and respect will come back to you. The third mystery word is: _Improve_.\n\n" +
    "After this step you unlock the <#" +
    discordChannelAuthID +
    "> channel" +
    ", then **select the three mystery words** that you have found through the previous sections:\n" +
    " <#973876989926707200>\n" + " <#973877161901588510>\n" + " <#973877261650497556>\n\n" +
    "You will be welcomed to our community with open arms and a sea of opportunities ahead.\n\n" +
    "**Click the 🚀 BUTTON below this message to unlock the authentication channel.**",
  ];

  if (messages1 != null && messages1.last() != null && messages1.last().embeds[0] != null) {
    // message present    
  } else {
    const row1 = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("buttonStep1")
        .setLabel("GO NEXT STEP ↩️")
        .setStyle("SUCCESS")
    );
    const embed1 = new MessageEmbed()
      .setColor("#00FF00")
      .setTitle("Clan Verifiy")
      .setDescription(descr[0]);

    channel1.send({ embeds: [embed1], components: [row1] });
  }

  if (messages2 != null && messages2.last() != null && messages2.last().embeds[0] != null) {
    // message present
  } else {
    const row2 = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("buttonStep2")
        .setLabel("GO NEXT STEP ↩️")
        .setStyle("SUCCESS")
    );
    const embed2 = new MessageEmbed()
      .setColor("#00FF00")
      .setTitle("Clan Values")
      .setDescription(descr[1]);

    channel2.send({ embeds: [embed2], components: [row2] });
  }

  if (messages3 != null && messages3.last() != null && messages3.last().embeds[0] != null) {
    // message present
  } else {
    const row3 = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("buttonStep3")
        .setLabel("GO NEXT STEP ↩️")
        .setStyle("SUCCESS")
    );
    const embed3 = new MessageEmbed()
      .setColor("#00FF00")
      .setTitle("Clan Order")
      .setDescription(descr[2]);

    channel3.send({ embeds: [embed3], components: [row3] });
  }

  if (messages4 != null && messages4.last() != null && messages4.last().embeds[0] != null) {
    // message present
  } else {
    const row4 = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("buttonStep4")
        .setLabel("🚀 UNLOCK AUTH")
        .setStyle("SUCCESS")
    );
    const embed4 = new MessageEmbed()
      .setColor("#00FF00")
      .setTitle("Clan Rules")
      .setDescription(descr[3]);

    channel4.send({ embeds: [embed4], components: [row4] });
  }

  // Auth channel zone
  const channel = client.channels.cache.get(discordChannelAuthID);
  const messages = await channel.messages.fetch({ limit: 1 });
  if (
    messages != null &&
    messages.last() != null &&
    messages.last().embeds[0].title == "Authentication 🥋"
  )
    return;

  const msgContent =
    "Select the **three mistery words** from the **drop-down** menus below.\n" +
    "Once you have selected the exact words, you will automatically " +
    "be promoted to **lvl 2** and can interact with the other members!";

  const select_1 = new MessageActionRow().addComponents(
    new MessageSelectMenu()
      .setCustomId("auth_word1")
      .setPlaceholder("1️⃣ Mistery Word")
      .addOptions([
        { label: "🔥 Form", value: "form" },
        { label: "🔥 Temple", value: "temple" },
        { label: "🔥 Build", value: "build" },
        { label: "🔥 Love", value: "love" },
        { label: "🔥 Tree", value: "tree" },
      ])
  );
  const select_2 = new MessageActionRow().addComponents(
    new MessageSelectMenu()
      .setCustomId("auth_word2")
      .setPlaceholder("2️⃣ Mistery Word")
      .addOptions([
        { label: "🎯 Star", value: "star" },
        { label: "🎯 Fool", value: "fool" },
        { label: "🎯 Sea", value: "sea" },
        { label: "🎯 Stay", value: "stay" },
        { label: "🎯 Pool", value: "pool" },
      ])
  );
  const select_3 = new MessageActionRow().addComponents(
    new MessageSelectMenu()
      .setCustomId("auth_word3")
      .setPlaceholder("3️⃣ Mistery Word")
      .addOptions([
        { label: "🚀 Fortitude", value: "fortitude" },
        { label: "🚀 Improve", value: "improve" },
        { label: "🚀 Discipline", value: "discipline" },
        { label: "🚀 Attitude", value: "attitude" },
        { label: "🚀 Persistence", value: "persistence" },
      ])
  );

  const embedopen = new Discord.MessageEmbed()
    .setDescription(msgContent)
    .setColor("#00FF00")
    .setTitle("Authentication 🥋")
    .setFooter({
      text: "ODA Clan Authentication Process",
      iconURL: "https://i.imgur.com/1ED6ifg.jpeg",
    });

  //channel.send({ content: msgContent, components: [select_1, select_2, select_3] });
  channel.send({
    embeds: [embedopen],
    components: [select_1, select_2, select_3],
  });
}
function assignLowerLevel(newM, remRoleId) {
  //console.log("[assignLowerLevel]")
  let roleLevel = getRoleLevel(remRoleId);
  if (newM.user.bot) {
    return;
  }
  if (roleLevel == 0) {
    addRole(newM, remRoleId);
    return;
  }
  let higestMemberLevel = getHigestLevel(newM.roles);
  //console.log(higestMemberLevel)

  if (higestMemberLevel == -1) {
    let lowerLevelId = "";
    Object.entries(roles).map((item) => {
      if (item[1].lvl == roleLevel - 1) lowerLevelId = item[1].id;
    });
    addRole(newM, lowerLevelId);
  }
}
function getHigestLevel(memberRoles) {
  let highest = -1;
  memberRoles.cache.forEach((role) => {
    let lvl = getRoleLevel(role.id);
    if (lvl > highest && isRoleALevel(role.id)) highest = lvl;
  });
  return highest;
}
function getRoleLevel(roleId) {
  let roleLevel = 0;
  Object.entries(roles).map((item) => {
    if (item[1].id == roleId) roleLevel = item[1].lvl;
  });
  return roleLevel;
}
function getRoleName(roleId) {
  let roleName = "";
  Object.entries(roles).map((item) => {
    if (item[1].id == roleId) roleName = item[0];
  });
  return roleName;
}
function getRoleId(roleLevel) {
  let roleId = "";
  Object.entries(roles).map((item) => {
    if (item[1].lvl == roleLevel) roleId = item[1].id;
  });
  return roleId;
}
function removeAllLevelsExcept(member, newRole) {
  member.roles.cache.forEach((role) => {
    if (role.id != newRole && isRoleALevel(role.id)) {
      removeRole(member.roles, role.id);
    }
  });
}
function sendWelcomeMessage(member, newRole) {
  const channel = client.channels.cache.get(getChatIdByRole(newRole));
  if (channel != "") {
    let welcomeMsg = "";
    let colorId = "";

    switch (newRole) {
      case roles.shonin.id:
        colorId = roles.shonin.color;
        welcomeMsg +=
          "**" + member.user.username + "** just reached **Lv.2 - Shōnin 商人** 🥋 \n\n";
        welcomeMsg +=
          "Welcome to the **ODA Clan, Kyodai**, you now walk on the virtuous path.";
        break;
      case roles.shokunin.id:
        colorId = roles.shokunin.color;
        welcomeMsg +=
          "**" + member.user.username + "** just reached **Lv.3 - Shokunin 職人** 🥋 \n\n";
        welcomeMsg +=
          "Congratulations on your well-deserved promotion, **Kyodai**, you have proved your worth by bringing value to the clan.";
        break;
      case roles.noka.id:
        colorId = roles.noka.color;
        welcomeMsg +=
          "**" + member.user.id + "** just reached **Lv.4 - Nōka 農家** 🥋 \n\n";
        welcomeMsg +=
          "Congratulations on your well-deserved promotion, **Kyodai**, you are now an essential part of our community, thank you for your dedication.";
        break;
      case roles.samurai.id:
        colorId = roles.samurai.color;
        welcomeMsg +=
          "**" + member.user.id + "** just reached **Lv.5 - Samurai 武士** 🥋 \n\n";
        welcomeMsg +=
          "Congratulations on becoming the true pillar of our community, **Kyodai**, you now have access to all the benefits and advantages that a true warrior deserves. ";
        break;
    }

    const embedopen = new Discord.MessageEmbed()
      .setDescription(welcomeMsg)
      .setColor(colorId);

    if (welcomeMsg != "") {
      channel.send({ embeds: [embedopen] }).then(function (message) {
        message.react("🔥").then(console.log).catch(console.error);
      });
    }
  }
}
function sendBoosterMessage(member) {
  let memberHighestLvl = getHigestLevel(member.roles);
  let channelChatID = getChatIdByLvl(memberHighestLvl);
  const channel = client.channels.cache.get(channelChatID);
  let filtered = Object.entries(roles).filter(
    ([key, value]) => value.lvl === memberHighestLvl
  )[0][1];
  let roleColor = filtered.color;

  if (channel != "") {
    let welcomeMsg =
      "Let’s go <@" + member.user.id + ">, thanks for server boosting 🚀";
    const embedopen = new Discord.MessageEmbed()
      .setDescription(welcomeMsg)
      .setColor(roleColor);

    channel.send({ embeds: [embedopen] }).then(function (message) {
      message.react("🔥").then(console.log).catch(console.error);
    });
  }
}
function isRoleALevel(roleId) {
  let isLevel = false;
  Object.entries(roles).map((item) => {
    if (roleId == item[1].id) isLevel = true;
  });
  return isLevel;
}
function getChatIdByRole(roleId) {
  let chatId = "";
  Object.entries(roles).map((item) => {
    if (roleId == item[1].id) chatId = item[1].chatid;
  });
  return chatId;
}
function getChatIdByLvl(roleLvl) {
  let chatId = "";
  Object.entries(roles).map((item) => {
    if (roleLvl == item[1].lvl) chatId = item[1].chatid;
  });
  return chatId;
}
function removeRole(member, role) {
  try {
    if (member.cache.has(role)) member.remove(role);
  } catch (e) {
    console.log("User [x] | Cant remove [" + role + "]");
    console.log(e);
  }
}
function addRole(member, role) {
  try {
    if (!member.roles.cache.has(role)) {
      member.roles.add(role);
    }
  } catch (e) {
    console.log("User [x] | Cant add [" + role + "]");
    console.log(e);
  }
}
