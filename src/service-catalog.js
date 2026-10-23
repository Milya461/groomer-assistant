const normalize = value => String(value || "")
  .toLocaleLowerCase("ru-RU")
  .replace(/ё/g, "е")
  .replace(/[^a-zа-я0-9]+/gi, " ")
  .trim()
  .replace(/\s+/g, " ");

function containsAny(value, aliases) {
  const text = normalize(value);
  return aliases.some(alias => text.includes(normalize(alias)));
}

const variantGroups = [
  {
    id: "spitz",
    aliases: ["шпиц", "spitz", "pomeranian"],
    label: "Размер шпица",
    variants: [
      { id: "карликовый", label: "Карликовый", aliases: ["карликовый", "карликовая", "мини"] },
      { id: "малый", label: "Малый", aliases: ["малый", "малая"] },
      { id: "средний", label: "Средний", aliases: ["средний", "средняя"] },
      { id: "большой", label: "Большой", aliases: ["большой", "большая"] }
    ]
  },
  {
    id: "poodle",
    aliases: ["пудель", "poodle"],
    label: "Размер пуделя",
    variants: [
      { id: "той", label: "Той", aliases: ["той", "toy"] },
      { id: "карликовый", label: "Карликовый", aliases: ["карликовый", "карликовая"] },
      { id: "малый", label: "Малый", aliases: ["малый", "малая"] }
    ]
  },
  {
    id: "maltipoo",
    aliases: ["мальтипу", "maltipoo"],
    label: "Размер мальтипу",
    variants: [
      { id: "той", label: "Той", aliases: ["той", "toy"] },
      { id: "карликовый", label: "Карликовый", aliases: ["карликовый", "карликовая"] },
      { id: "малый", label: "Малый", aliases: ["малый", "малая"] },
      { id: "большой", label: "Большой", aliases: ["большой", "большая"] }
    ]
  },
  {
    id: "chihuahua",
    aliases: ["чихуахуа", "chihuahua"],
    label: "Тип шерсти",
    variants: [
      { id: "гладкошерстный", label: "Гладкошерстный", aliases: ["гладкошерст", "гладкошерстная", "smooth"] },
      { id: "длинношерстный", label: "Длинношерстный", aliases: ["длинношерст", "длинношерстная", "long hair", "longhair"] }
    ]
  },
  {
    id: "dachshund",
    aliases: ["такса", "dachshund"],
    label: "Тип шерсти",
    variants: [
      { id: "гладкошерстная", label: "Гладкошерстная", aliases: ["гладкошерст", "smooth"] },
      { id: "длинношерстная", label: "Длинношерстная", aliases: ["длинношерст", "long hair", "longhair"] }
    ]
  },
  {
    id: "toy-terrier",
    aliases: ["тойтерьер", "той терьер", "русский той", "toy terrier", "russian toy"],
    label: "Тип шерсти",
    variants: [
      { id: "гладкошерстный", label: "Гладкошерстный", aliases: ["гладкошерст", "smooth"] },
      { id: "длинношерстный", label: "Длинношерстный", aliases: ["длинношерст", "long hair", "longhair"] }
    ]
  }
];

function findVariantGroup(breed) {
  const text = normalize(breed);
  // Check specific multi-word breeds before generic matches.
  return variantGroups.find(group => containsAny(text, group.aliases)) || null;
}

function inferVariant(group, breed) {
  const text = normalize(breed);
  return group?.variants.find(variant => containsAny(text, variant.aliases)) || null;
}

export function getBreedVariantOptions(breed, species = "dog") {
  if (species !== "dog") return { requiresVariant: false, label: "", options: [], value: "" };
  const group = findVariantGroup(breed);
  if (!group) return { requiresVariant: false, label: "", options: [], value: "" };
  const inferred = inferVariant(group, breed);
  return {
    requiresVariant: true,
    groupId: group.id,
    label: group.label,
    options: group.variants.map(item => ({ value: item.id, label: item.label })),
    value: inferred ? inferred.id : ""
  };
}

const item = (id, label, price, extra = {}) => ({
  id, label, price: Number(price), rate: 35, ...extra
});

function groom(id, label, price) {
  return item("groom:" + id, label, price, { type: "base" });
}

const additionalServices = [
  item("addon:premium-spa", "Премиум СПА-уход", 1100, {
    type: "addon",
    minutes: 30,
    sizeChoices: [
      { value: "small", label: "Для маленьких", price: 1100 },
      { value: "medium", label: "Для средних", price: 1100 }
    ]
  }),
  item("addon:derma-spa", "Дерма СПА-уход", 600, {
    type: "addon",
    minutes: 30,
    sizeChoices: [
      { value: "small", label: "Для маленьких", price: 600 },
      { value: "medium", label: "Для средних", price: 700 }
    ]
  }),
  item("addon:coat-care", "Дополнительный уход по типу шерсти", 600, {
    type: "addon",
    minutes: 15,
    note: "Тип ухода выбирается по типу шерсти",
    sizeChoices: [
      { value: "small", label: "Для маленьких", price: 600 },
      { value: "medium", label: "Для средних", price: 1000 }
    ]
  }),
  item("addon:teeth-cleaning", "Профилактическая чистка зубов", 450, {
    type: "addon",
    minutes: 10,
    note: "На присланном скриншоте после 450 ₽ часть суммы закрыта; цену можно изменить"
  }),
  item("addon:paw-pads", "Уход за подушечками лап", 300, {
    type: "addon",
    minutes: 10
  })
];

function getVariantForPet(pet) {
  const group = findVariantGroup(pet?.breed);
  if (!group) return null;
  const stored = normalize(pet?.breed_variant);
  return group.variants.find(v => normalize(v.id) === stored || normalize(v.label) === stored)
    || inferVariant(group, pet?.breed)
    || null;
}

function baseServicesForPet(pet) {
  const breed = normalize(pet?.breed);
  const variantGroup = findVariantGroup(pet?.breed);
  const variant = getVariantForPet(pet);

  if (variantGroup && !variant) return [];
  if (variantGroup?.id === "spitz") {
    const map = {
      "карликовый": [groom("hygiene", "Гигиена", 2500), groom("beautiful", "По красивой", 3000)],
      "малый": [groom("hygiene", "Гигиена", 2600), groom("beautiful", "По красивой", 3200)],
      "средний": [groom("hygiene", "Гигиена", 2900), groom("beautiful", "По красивой", 3400)],
      "большой": [groom("hygiene", "Гигиена", 3000), groom("beautiful", "По красивой", 3500)]
    };
    // Deliberately no "Под машинку" for any Spitz size.
    return map[variant.id] || [];
  }
  if (variantGroup?.id === "maltipoo") {
    const map = {
      "той": [groom("hygiene", "Гигиена", 2600), groom("clipper", "Под машинку", 3000), groom("medium", "Средняя стрижка", 3100), groom("beautiful", "По красивой", 3300)],
      "карликовый": [groom("hygiene", "Гигиена", 2600), groom("clipper", "Под машинку", 3000), groom("medium", "Средняя стрижка", 3300), groom("beautiful", "По красивой", 3500)],
      "малый": [groom("hygiene", "Гигиена", 2800), groom("clipper", "Под машинку", 3300), groom("medium", "Средняя стрижка", 3500), groom("beautiful", "По красивой", 3700)],
      "большой": [groom("medium", "Средняя стрижка", 4300), groom("beautiful", "По красивой", 4500)]
    };
    return map[variant.id] || [];
  }
  if (variantGroup?.id === "poodle") {
    const map = {
      "той": [groom("hygiene", "Гигиена", 2600), groom("clipper", "Под машинку", 3000), groom("medium", "Средняя стрижка", 3100), groom("beautiful", "По красивой", 3300)],
      "карликовый": [groom("hygiene", "Гигиена", 2600), groom("clipper", "Под машинку", 3000), groom("medium", "Средняя стрижка", 3300), groom("beautiful", "По красивой", 3500)],
      "малый": [groom("hygiene", "Гигиена", 2700), groom("clipper", "Под машинку", 3300), groom("medium", "Средняя стрижка", 3500), groom("beautiful", "По красивой", 3700)]
    };
    return map[variant.id] || [];
  }
  if (variantGroup?.id === "chihuahua") {
    if (variant.id === "гладкошерстный") return [groom("complex", "Комплекс", 3400)];
    return [
      groom("clipper", "Под машинку", 2500),
      groom("no-cut", "Без стрижки", 2400),
      groom("with-cut", "Со стрижкой", 2600)
    ];
  }
  if (variantGroup?.id === "dachshund") {
    if (variant.id === "гладкошерстная") return [groom("complex", "Комплекс", 2600)];
    // In the provided price list, no prices were legible for the long-haired Dachshund.
    return [item("groom:manual-dachshund", "Услуга для длинношерстной таксы · цена вручную", 0, { type: "base", editable: true })];
  }
  if (variantGroup?.id === "toy-terrier") {
    if (variant.id === "гладкошерстный") return [groom("hygiene", "Гигиена", 2400)];
    return [
      groom("clipper", "Под машинку", 2500),
      groom("no-cut", "Без стрижки", 2500),
      groom("with-cut", "Со стрижкой", 2500)
    ];
  }

  const rules = [
    { aliases: ["бишон", "bichon"], prices: [["Гигиена",2700],["Под машинку",3000],["Средняя стрижка",3300],["По красивой",3700]] },
    { aliases: ["вест хайленд", "вест-хайленд", "west highland", "westie"], prices: [["Гигиена",2800],["Под машинку",3100],["По красивой",3300]] },
    { aliases: ["мальтезе", "мальтийская болонка", "maltese"], prices: [["Гигиена",2400],["Под машинку",2900],["Средняя стрижка",3100],["По красивой",3300]] },
    { aliases: ["ши тцу", "шитцу", "ши-тцу", "shih tzu"], prices: [["Гигиена",2800],["Под машинку",3000],["Средняя стрижка",3200],["По красивой",3400]] },
    { aliases: ["кхс", "китайская хохлатая", "chinese crested"], prices: [["Средняя стрижка",3200],["По красивой",3500]] },
    { aliases: ["пекинес", "pekingese"], prices: [["Гигиена",2600],["Под машинку",3000],["Средняя стрижка",3200],["По красивой",3400]] },
    { aliases: ["кокапу", "cockapoo"], prices: [["Гигиена",2600],["Под машинку",3100],["Средняя стрижка",3400],["По красивой",3700]] },
    { aliases: ["кавапу", "cavapoo"], prices: [["Гигиена",2600],["Под машинку",3100],["Средняя стрижка",3400],["По красивой",3700]] },
    { aliases: ["йорк", "йоркширский терьер", "yorkshire terrier"], prices: [["Гигиена",2300],["Под машинку",2900],["По красивой",3200]] },
    { aliases: ["помапу", "pomapoo"], prices: [["Под машинку",3100],["Средняя стрижка",3400],["По красивой",3700]] },
    { aliases: ["американский кокер", "кокер спаниель", "кокер-спаниель", "cocker spaniel", "спаниель", "spaniel"], prices: [groom("spaniel", "Стрижка по прайсу",3400)] },
    { aliases: ["кавалер", "cavalier"], prices: [["Под машинку",3400],["Без стрижки",3200],["Со стрижкой",3400]] },
    { aliases: ["мопс", "pug"], prices: [["Комплекс",3100]] },
    { aliases: ["бульдог", "bulldog"], prices: [item("groom:complex", "Комплекс", 3100, { type: "base", priceRange: { min: 3100, max: 3600 }, note: "В прайсе указан диапазон 3 100–3 600 ₽; итоговую сумму можно исправить" })] },
    { aliases: ["гриффон", "griffon"], prices: [["Комплекс",3200]] },
    { aliases: ["джек рассел", "джек-рассел", "jack russell"], prices: [["Комплекс",3100]] },
    { aliases: ["фокстерьер", "фокс терьер", "fox terrier"], prices: [["Комплекс",3200]] },
    { aliases: ["басенджи", "basenji"], prices: [["Комплекс",3100]] },
    { aliases: ["баварская гончая", "bavarian mountain hound"], prices: [["Комплекс",3200]] },
    { aliases: ["бультерьер", "bull terrier", "bullterrier"], prices: [["Комплекс",3200]] },
    { aliases: ["папильон", "papillon"], prices: [["Гигиена",2400],["Комплекс",3200]] },
    { aliases: ["японский хин", "japanese chin"], prices: [["Комплекс",3200]] },
    { aliases: ["пти брабансон", "пти-брабансон", "petit brabancon", "brabancon"], prices: [["Комплекс",3100]] }
  ];
  const rule = rules.find(row => containsAny(breed, row.aliases));
  if (rule) {
    return rule.prices.map(entry => Array.isArray(entry)
      ? groom(entry[0].toLowerCase().replace(/[^a-zа-я0-9]+/gi, "-"), entry[0], entry[1])
      : { ...entry, type: "base" });
  }
  return [item("groom:manual", "Другая услуга · цена вручную", 0, { type: "base", editable: true })];
}

function addOnSizeForPet(pet) {
  const variant = getVariantForPet(pet);
  const group = findVariantGroup(pet?.breed);
  if (variant && group) {
    const value = normalize(variant.id);
    if (group.id === "spitz") return ["карликовый", "малый"].includes(value) ? "small" : "medium";
    if (group.id === "poodle") return ["той", "карликовый"].includes(value) ? "small" : "medium";
    if (group.id === "maltipoo") return ["той", "карликовый"].includes(value) ? "small" : "medium";
  }
  const breed = normalize(pet?.breed);
  if (containsAny(breed, ["кокапу", "кавапу", "спаниель", "бишон", "вест хайленд", "малый пудель"])) return "medium";
  return "small";
}

export function getServiceOptions(pet) {
  const variant = getBreedVariantOptions(pet?.breed, pet?.species || "dog");
  const selectedVariant = getVariantForPet(pet);
  if (variant.requiresVariant && !selectedVariant) {
    return {
      pet: { id: Number(pet.id), name: pet.name, breed: pet.breed, breed_variant: pet.breed_variant || "" },
      requiresVariant: true,
      variantLabel: variant.label,
      variantOptions: variant.options,
      baseServices: [],
      additionalServices
    };
  }
  const defaultAddonSize = addOnSizeForPet(pet);
  const addons = additionalServices.map(service => ({
    ...service,
    sizeChoices: service.sizeChoices || null,
    defaultSize: defaultAddonSize,
    price: service.sizeChoices
      ? Number(service.sizeChoices.find(choice => choice.value === defaultAddonSize)?.price || service.sizeChoices[0].price)
      : service.price
  }));
  return {
    pet: { id: Number(pet.id), name: pet.name, breed: pet.breed, breed_variant: pet.breed_variant || "" },
    requiresVariant: false,
    variantLabel: variant.label,
    variantOptions: variant.options,
    defaultAddonSize,
    baseServices: baseServicesForPet(pet),
    additionalServices: addons
  };
}

export function resolveServiceSelection(pet, selections) {
  const options = getServiceOptions(pet);
  if (options.requiresVariant) {
    return { error: "Сначала укажи размер или разновидность питомца в его карточке.", status: 400 };
  }
  if (!Array.isArray(selections) || selections.length < 1 || selections.length > 12) {
    return { error: "Выбери основную услугу и дополнительные услуги.", status: 400 };
  }
  const available = [...options.baseServices, ...options.additionalServices];
  const resolved = [];
  for (const selected of selections) {
    const source = available.find(item => item.id === selected.id);
    if (!source) return { error: "Выбрана неизвестная услуга. Обнови страницу и выбери её заново.", status: 400 };
    const amount = Number(selected.amount);
    if (!Number.isFinite(amount) || amount < 0 || amount > 100000) {
      return { error: "Проверь сумму каждой услуги.", status: 400 };
    }
    let label = source.label;
    let rate = source.rate || 35;
    if (source.sizeChoices) {
      const sizeChoice = source.sizeChoices.find(choice => choice.value === selected.size);
      if (!sizeChoice) return { error: "Выбери размер для дополнительной услуги.", status: 400 };
      label += " · " + sizeChoice.label.toLowerCase();
    }
    if (/когт|коготк|параанальн|чаев/i.test(label)) rate = 100;
    resolved.push({ id: source.id, label, amount: Math.round(amount * 100) / 100, rate });
  }
  const baseCount = resolved.filter(service => service.id.startsWith("groom:")).length;
  if (baseCount !== 1) return { error: "Выбери ровно одну основную услугу.", status: 400 };
  return { services: resolved };
}
