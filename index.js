const Discord = require('discord.js');
const { MessageActionRow, MessageSelectMenu, MessageEmbed, Client, Intents } = require('discord.js');
const config = require('./config.json');
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
  partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

const discordChannelAuthID = '981241291784458301'
const discordOdaClanID = '961194963549429821'
const boosterRoleID = '978314842601578547'
const roles = {
  hinin1_0: { lvl: 0, id: '980930897354301490', chatid: '' },
  hinin1_1: { lvl: 1, id: '980447398755184640', chatid: '' },
  hinin1_2: { lvl: 2, id: '980447527591616572', chatid: '' },
  hinin1_3: { lvl: 3, id: '980447588937523221', chatid: '' },
  hinin: { lvl: 4, id: '973246305545641984', chatid: '' },
  shonin: { lvl: 5, id: '971712502230552626', chatid: '978286109635272714', color: '#00ffff' },
  shokunin: { lvl: 6, id: '971547768172716032', chatid: '972204262006345728', color: '#00ff00' },
  noka: { lvl: 7, id: '969701663344558130', chatid: '969702669507768392', color: '#ffff00' },
  samurai: { lvl: 8, id: '961561497115443250', chatid: '969703459983097956', color: '#ff0000' },
  daimyo: { lvl: 9, id: '971728564984635442', chatid: '972210778801315941', color: '#ff9900' },
  tenno: { lvl: 10, id: '961197439979761723', chatid: '972211000470286390', color: '#ff0000' },
}
const adviseChannels = [
  '961195429565988904',
  '971709981260931072',
  '961195756805574666', // oracleCrypto
  '961195720067657728', // oracleNft
  '969703506237866034',
  '976777076512260106',
  '961195506187505674',
  '979077895827894342', // clanHistory
  '981252611875426334', // crypto add 1
  '981252683132436520', // crypto add 2
  '981253254908346388', // nft add 1
  '981253299179253790', // nft add 2
]
const reactableMsg = {
  clanVerify: '981096878659751977',
  clanValues: '981097285775654952',
  clanOrder: '981100589545029642',
  clanRules: '981101874038067210'
}
const bulkReactEmoji = [
  '🔥', '❤️', '🎉', '👀', '✅', '🚀', '💯', '🍀', '💎', '👁️', '🤩', '😎', '👊', '😊', '🙏', '💫', '💥', '⚡', '☄️', '🐲'
]
const correctWords = ['build', 'stay', 'improve'];
const userAuth = {}


client.on('ready', () => {
  prepareAuthMessage()
  console.log('Logged in!');
});

client.on('guildMemberUpdate', (oldMember, newMember) => {

  try {
    const newM = newMember.roles.cache;
    const oldM = oldMember.roles.cache;

    if (oldM.size > newM.size) {
      // ------------------ Role removed
      let remRoleId = ''
      oldM.forEach(role => {
        if (!newM.has(role.id) && isRoleALevel(role.id)) {
          remRoleId = role.id
        }
      });
      //console.log("se " + getRoleLevel(remRoleId));
      //console.log("< di " + getHigestLevel(newMember.roles));
      if (getRoleLevel(remRoleId) < getHigestLevel(newMember.roles)) return
      if (remRoleId != '') assignLowerLevel(newMember, remRoleId)

    } else if (oldM.size < newM.size) {
      // ------------------ Role added
      let newRoleId = ''
      newM.forEach(role => {
        if (!oldM.has(role.id)) {
          newRoleId = role.id
        }
      });
      if (newRoleId == boosterRoleID) {
        sendBoosterMessage(newMember)
        return
      }
      if (newRoleId == '') return
      if (getRoleLevel(newRoleId) < 5 && getHigestLevel(newMember.roles) == 5) {
        removeAllLevelsExcept(newMember, newRoleId)
        return
      }
      if (getRoleLevel(newRoleId) < 5) {
        removeAllLevelsExcept(newMember, newRoleId)
        return
      }
      //console.log("se " + getRoleLevel(newRoleId));
      //console.log("< di " + getHigestLevel(newMember.roles));
      if (getRoleLevel(newRoleId) < getHigestLevel(newMember.roles)) {
        removeAllLevelsExcept(newMember, newRoleId)
        return
      }
      //console.log('new role id lvl [' + getRoleLevel(newRoleId) + ']')
      if (newRoleId != '') {
        removeAllLevelsExcept(newMember, newRoleId)
        sendWelcomeMessage(newMember, newRoleId)
      }
    }
  } catch (e) {
    console.log('error [' + e + ']');
  }
})

client.on('messageCreate', async message => {
  // nothing yet
})

client.on('messageReactionAdd', async (reaction, user) => {

  if (reaction.me) return;
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error('Something went wrong when fetching the message:', error);
      return;
    }
  }

  if (reaction.me) return;

  let guild = client.guilds.cache.get(discordOdaClanID);
  let member = guild.members.cache.get(user.id);

  if (adviseChannels.includes(reaction.message.channelId)) {
    if (reaction.message.createdTimestamp < 1654113600000) return
    let reactedEmoji = reaction.emoji.name
    reaction.message.react(reactedEmoji)
    const shuffledEmoji = bulkReactEmoji.sort((a, b) => 0.5 - Math.random());
    shuffledEmoji.forEach(async (e) => await reaction.message.react(e))
    return
  }

  let memberHighestLvl = getHigestLevel(member.roles)
  switch (reaction.message.id) {
    case reactableMsg.clanVerify:
      if (memberHighestLvl == roles.hinin1_0.lvl)
        addRole(member, roles.hinin1_1.id)
      break
    case reactableMsg.clanValues:
      if (memberHighestLvl == roles.hinin1_1.lvl)
        addRole(member, roles.hinin1_2.id)
      break
    case reactableMsg.clanOrder:
      if (memberHighestLvl == roles.hinin1_2.lvl)
        addRole(member, roles.hinin1_3.id)
      break
    case reactableMsg.clanRules:
      if (memberHighestLvl == roles.hinin1_3.lvl)
        addRole(member, roles.hinin.id)
      break
    default:
      // nothing to do
      break
  }
});

client.on('messageReactionRemove', (reaction, user) => {
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isSelectMenu()) return;
  if (getHigestLevel(interaction.member.roles) != 4) {
    interaction.deferUpdate();
    return;
  }

  let selected = interaction != null
    && interaction.values != null
    && interaction.values[0] != null ? interaction.values[0] : '';

  if (userAuth[interaction.user.id] == null) {
    userAuth[interaction.user.id] = []
  }
  userAuth[interaction.user.id].push(selected)

  const multipleExist = correctWords.every(value => {
    return userAuth[interaction.user.id].includes(value);
  });
  if (multipleExist) {
    try { delete userAuth[interaction.user.id] } catch (e) { }
    interaction.reply({
      content: `Let's go ✅ \nYou completed the verification process`,
      ephemeral: true
    })
    //addRole(interaction.member, roles.shonin.id)
    addRole(interaction.member, roles.shokunin.id)
    return
  }

  switch (interaction.customId) {
    case 'auth_word1':
      interaction.deferUpdate();
      break;
    case 'auth_word2':
      interaction.deferUpdate();
      break;
    case 'auth_word3':
      interaction.deferUpdate();
      break;
  }
});

client.login(config.token);



/* ------------------------------ UTILS ------------------------------ */

async function prepareAuthMessage() {

  const channel = client.channels.cache.get(discordChannelAuthID);
  const messages = await channel.messages.fetch({ limit: 1 });
  if (messages != null
    && messages.last() != null
    && messages.last().embeds[0].title == 'Authentication 🥋') return

  const msgContent =
    'Select the **three mistery words** from the **drop-down** menus below.\n'
    + 'Once you have selected the exact words, you will automatically '
    + 'be promoted to **lvl 2** and can interact with the other members!'

  const select_1 = new MessageActionRow()
    .addComponents(
      new MessageSelectMenu()
        .setCustomId('auth_word1')
        .setPlaceholder('1️⃣ Mistery Word')
        .addOptions([
          { label: '🔥 Form', value: 'form' },
          { label: '🔥 Temple', value: 'temple' },
          { label: '🔥 Build', value: 'build' },
          { label: '🔥 Love', value: 'love' },
          { label: '🔥 Tree', value: 'tree' }
        ]),
    )
  const select_2 = new MessageActionRow()
    .addComponents(
      new MessageSelectMenu()
        .setCustomId('auth_word2')
        .setPlaceholder('2️⃣ Mistery Word')
        .addOptions([
          { label: '🎯 Star', value: 'star' },
          { label: '🎯 Fool', value: 'fool' },
          { label: '🎯 Sea', value: 'sea' },
          { label: '🎯 Stay', value: 'stay' },
          { label: '🎯 Pool', value: 'pool' }
        ]),
    )
  const select_3 = new MessageActionRow()
    .addComponents(
      new MessageSelectMenu()
        .setCustomId('auth_word3')
        .setPlaceholder('3️⃣ Mistery Word')
        .addOptions([
          { label: '🚀 Fortitude', value: 'fortitude' },
          { label: '🚀 Improve', value: 'improve' },
          { label: '🚀 Discipline', value: 'discipline' },
          { label: '🚀 Attitude', value: 'attitude' },
          { label: '🚀 Persistence', value: 'persistence' }
        ]),
    )

  const embedopen = new Discord.MessageEmbed()
    .setDescription(msgContent)
    .setColor('#378805')
    .setTitle('Authentication 🥋')
    .setFooter({
      text: 'ODA Clan Authentication Process',
      iconURL: 'https://i.imgur.com/1ED6ifg.jpeg'
    });

  //channel.send({ content: msgContent, components: [select_1, select_2, select_3] });
  channel.send({ embeds: [embedopen], components: [select_1, select_2, select_3] });
}
function assignLowerLevel(newM, remRoleId) {
  //console.log("[assignLowerLevel]")
  let roleLevel = getRoleLevel(remRoleId)
  if (newM.user.bot) {
    return
  }
  if (roleLevel == 0) {
    addRole(newM, remRoleId)
    return
  }
  let higestMemberLevel = getHigestLevel(newM.roles)
  //console.log(higestMemberLevel)

  if (higestMemberLevel == -1) {
    let lowerLevelId = '';
    Object.entries(roles).map(item => {
      if (item[1].lvl == (roleLevel - 1)) lowerLevelId = item[1].id
    })
    addRole(newM, lowerLevelId)
  }
}
function getHigestLevel(memberRoles) {
  let highest = -1;
  memberRoles.cache.forEach(role => {
    let lvl = getRoleLevel(role.id)
    if (lvl > highest && isRoleALevel(role.id)) highest = lvl
  })
  return highest
}
function getRoleLevel(roleId) {
  let roleLevel = 0;
  Object.entries(roles).map(item => {
    if (item[1].id == roleId) roleLevel = item[1].lvl
  })
  return roleLevel;
}
function getRoleName(roleId) {
  let roleName = '';
  Object.entries(roles).map(item => {
    if (item[1].id == roleId) roleName = item[0]
  })
  return roleName;
}
function getRoleId(roleLevel) {
  let roleId = '';
  Object.entries(roles).map(item => {
    if (item[1].lvl == roleLevel) roleId = item[1].id
  })
  return roleId;
}
function removeAllLevelsExcept(member, newRole) {
  member.roles.cache.forEach(role => {
    if (role.id != newRole && isRoleALevel(role.id)) {
      removeRole(member.roles, role.id)
    }
  });
}
function sendWelcomeMessage(member, newRole) {
  const channel = client.channels.cache.get(getChatIdByRole(newRole));
  if (channel != '') {
    let welcomeMsg = ''
    let colorId = ''

    switch (newRole) {
      case roles.shonin.id:
        colorId = roles.shonin.color
        welcomeMsg += '<@' + member.user.id + '> just reached Lv.2 - Shōnin 商人\n'
        welcomeMsg += 'Welcome to the ODA Clan, Kyodai, you now walk on the virtuous path.'
        break;
      case roles.shokunin.id:
        colorId = roles.shokunin.color
        welcomeMsg += '<@' + member.user.id + '> just reached Lv.3 - Shokunin 職人\n'
        welcomeMsg += 'Congratulations on your well-deserved promotion, Kyodai, you have proved your worth by bringing value to the clan.'
        break;
      case roles.noka.id:
        colorId = roles.noka.color
        welcomeMsg += '<@' + member.user.id + '> just reached Lv.4 - Nōka 農家\n'
        welcomeMsg += 'Congratulations on your well-deserved promotion, Kyodai, you are now an essential part of our community, thank you for your dedication.'
        break;
      case roles.samurai.id:
        colorId = roles.samurai.color
        welcomeMsg += '<@' + member.user.id + '> just reached Lv.5 - Samurai 武士\n'
        welcomeMsg += 'Congratulations on becoming the true pillar of our community, Kyodai, you now have access to all the benefits and advantages that a true warrior deserves. '
        break;
    }

    const embedopen = new Discord.MessageEmbed()
      .setDescription(welcomeMsg)
      .setColor(colorId);

    if (welcomeMsg != '') {
      channel.send({ embeds: [embedopen] }).then(function (message) {
        message.react("🔥")
          .then(console.log)
          .catch(console.error);
      });
    }
  }
}
function sendBoosterMessage(member) {
  let memberHighestLvl = getHigestLevel(member.roles)
  let channelChatID = getChatIdByLvl(memberHighestLvl)
  const channel = client.channels.cache.get(channelChatID);
  if (channel != '') {
    let welcomeMsg = 'Let’s go <@' + member.user.id + '>, thanks for server boosting 🚀'
    channel.send({ content: welcomeMsg })
      .then(function (message) {
        message.react("🔥")
          .then(console.log)
          .catch(console.error);
      });
  }
}
function isRoleALevel(roleId) {
  let isLevel = false;
  Object.entries(roles).map(item => {
    if (roleId == item[1].id) isLevel = true
  })
  return isLevel
}
function getChatIdByRole(roleId) {
  let chatId = '';
  Object.entries(roles).map(item => {
    if (roleId == item[1].id) chatId = item[1].chatid
  })
  return chatId
}
function getChatIdByLvl(roleLvl) {
  let chatId = '';
  Object.entries(roles).map(item => {
    if (roleLvl == item[1].lvl) chatId = item[1].chatid
  })
  return chatId
}
function removeRole(member, role) {
  try {
    if (member.cache.has(role)) member.remove(role);
  } catch (e) {
    console.log('User [x] | Cant remove [' + role + ']');
    console.log(e);
  }
}
function addRole(member, role) {
  try {
    if (!member.roles.cache.has(role)) {
      member.roles.add(role);
    }
  } catch (e) {
    console.log('User [x] | Cant add [' + role + ']');
    console.log(e);
  }
}