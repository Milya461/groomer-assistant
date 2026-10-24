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
    note: "Профилактическая чистка зубов"
  }),
  item("addon:anal-glands", "Чистка параанальных желез", 300, {
    type: "addon",
    minutes: 10
  }),
  item("addon:paw-pads", "Уход за подушечками лап", 300, {
    type: "addon",
    minutes: 10
  }),
  item("addon:mat-removal", "Колтуны", 500, {
    type: "addon",
    minutes: 15
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
    { aliases: ["помапу", "pomapoo"], prices: [["Гигиена",2600],["Под машинку",3100],["Средняя стрижка",3400],["По красивой",3700]] },
    { aliases: ["померанский", "pomeranian"], prices: [["Гигиена",2500],["По красивой",3000]] },
    { aliases: ["корги", "corgi"], prices: [["Гигиена",2600],["Под машинку",3000],["Средняя стрижка",3200],["По красивой",3400]] },
    { aliases: ["самоед", "samoyed"], prices: [["Гигиена",3500],["По красивой",4000]] },
    { aliases: ["голден ретривер", "golden retriever"], prices: [["Гигиена",3500],["По красивой",4000]] },
    { aliases: ["лабрадор", "labrador"], prices: [["Гигиена",3000],["По красивой",3500]] }
  ];
  const rule = rules.find(item => containsAny(breed, item.aliases));
  if (rule) return rule.prices.map(([label, price], index) => groom("rule-" + index + "-" + normalize(label), label, price));
  return [groom("default", "Гигиена", 2500)];
}

export function getServiceOptions(pet) {
  const baseServices = baseServicesForPet(pet);
  return {
    baseServices,
    additionalServices,
    defaultAddonSize: "small",
    breedVariant: getBreedVariantOptions(pet?.breed, pet?.species)
  };
}

export function resolveServiceSelection(pet, selections = []) {
  const options = getServiceOptions(pet);
  const byId = new Map([...options.baseServices, ...options.additionalServices].map(service => [service.id, service]));
  const services = [];
  for (const selection of selections) {
    const source = byId.get(selection.id);
    if (!source) continue;
    let amount = Number(selection.amount);
    if (!Number.isFinite(amount) || amount < 0) amount = source.price;
    if (source.sizeChoices?.length) {
      const size = source.sizeChoices.find(choice => choice.value === selection.size) || source.sizeChoices[0];
      amount = Number(selection.amount);
      if (!Number.isFinite(amount) || amount < 0) amount = Number(size.price);
    }
    const label = source.sizeChoices?.length
      ? source.label + " · " + (source.sizeChoices.find(choice => choice.value === selection.size)?.label || source.sizeChoices[0].label)
      : source.label;
    services.push({ id: source.id, label, amount: Math.round(amount * 100) / 100, rate: source.rate });
  }
  return { services, totalAmount: Math.round(services.reduce((sum, service) => sum + service.amount, 0) * 100) / 100 };
}

export function getServiceCatalog() {
  return { additionalServices };
}
