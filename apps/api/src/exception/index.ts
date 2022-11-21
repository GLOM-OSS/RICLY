export const sAUTH403 = {
  en: `Your session or role is invalid. Please login with the right role!`,
  fr: 'Votre session ou role est non valide. Veuillez vous connecter avec le role approprié !',
};
export const AUTH01 = {
  en: `Your google access token or email has been invalidated`,
  fr: `Votre jeton d'accès à Google ou votre adresse électronique a été invalidée.`,
};
export const AUTH02 = {
  en: `Sorry, your have more than two session open. Consider closing one.`,
  fr: `Désolé, vous avez plus de deux sessions ouvertes. Pensez à en fermer une.`,
};
export const AUTH03 = (message: string) => ({
  en: `Your login request failed with error: ${message}`,
  fr: `La demande de connexion a échoué avec l'erreur : ${message}`,
});
export const AUTH04 = {
  en: `Oops, you've recently triggered this action. Please try later`,
  fr: 'Oups, vous avez récemment déclenché cette action. Veuillez essayer plus tard',
};
export const AUTH05 = {
  en: `Your API access are invalid`,
  fr: `Vos accès d'API sont non valide`,
};
export const AUTH06 = (message: string) => ({
  en: `Log out error ${message}`,
  fr: `Erreur de deconnexion ${message}`,
});
export const AUTH07 = {
  en: `Please, provide the right credentials`,
  fr: `S'il vous plaît, fournissez les bonnes références`,
};
export const AUTH08 = {
  en: `Oops, you have an ongoing subscription. Try later`,
  fr: 'Oups, vous avez un abonnement en cours. Essayez plus tard',
};
export const AUTH09 = {
  en: `API access are forbidden`,
  fr: `Accès d'API non authorisé`,
};
export const AUTH10 = {
  en: `Incorrect password.`,
  fr: 'Mot de passe incorrect.',
};
export const AUTH11 = {
  en: `Sorry, we could not destroy your session`,
  fr: `Désolé, nous avons pas pu deruire votre session`,
};
export const AUTH400 = {
  en: `Bad Request. Invalid grant`,
  fr: 'Mauvaise demande. Subvention non valide',
};
export const AUTH401 = {
  en: `Incorrect email or password.`,
  fr: 'Adresse mail ou mot de passe incorrect.',
};
export const AUTH404 = (search: string) => ({
  en: `"<${search}> not found.`,
  fr: `<${search}> introuvable`,
});
export const sAUTH404 = {
  en: `Your reset password request cannot be found or has expired.`,
  fr: `Votre demande de renouvellement de mot de passe est introuvable ou a expiré.`,
};

export const AUTH403 = (ressource: string) => ({
  en: `Access borbidden for ${ressource}.`,
  fr: `Accès interdit pour ${ressource}`,
});
export const AUTH500 = {
  en: `Sorry, This error was not suppose to happen. Our team is working on it.`,
  fr: `Désolé, Cette erreur n'est pas sensé arriver. Nos equipe travail dessus.`,
};
export const AUTH501 = (element: string) => ({
  en: `Sorry, <${element}> is not yet implemented`,
  fr: `Désolé, <${element}> n'est pas encore implémenté.`,
});
export const AUTH503 = {
  en: `Sorry, this action cannot be processed now. Consider trying later or with another account`,
  fr: 'Désolé, cette action ne peut être traitée maintenant. Essayez plus tard ou avec un autre compte',
};

export const ERR01 = {
  en: `You most provide one and only one of the optional attributes`,
  fr: `Vous ne pouvez fournir qu'un et qu'un seul des attributs facultatifs`,
};
export const ERR02 = {
  en: `Invalid school demand identifier`,
  fr: `Identifiant de la demande non valide`,
};
export const ERR03 = (element: string) => ({
  en: `This element(${element}) already exits`,
  fr: `Cette element(${element}) existe déjà`,
});
export const ERR04 = {
  en: `The number of classes in a specialty cannot differ from the number of years available in its curriculum.`,
  fr: `Le nombre de classes dans une spécialité ne peut différer du nombre d'années disponibles dans son cursus.`,
};
