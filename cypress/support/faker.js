import { faker } from '@faker-js/faker/locale/pt_BR';

export function generateName() {
  return faker.person.fullName();
}

export function generateEmail(name = generateName()) {
  const emailName = name
    .normalize("NFD")
    .toLowerCase()
    .replace(/\s+/g, '.')
    .trim()
    .replace(/[^a-z0-9\s]/g, '');

  return `${emailName}@gmail.com`;
}

export function generateUsers() {
  const name = generateName();
  const email = generateEmail();

  return {
    name,
    email
  };
}
