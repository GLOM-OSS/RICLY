export const sAUTH403 = {
  En: `Your session is invalid. Please login!`,
  Fr: 'Votre session est non valide. Veuillez vous connecter !',
};
export const AUTH01 = {
  En: `Your google access token or email has been invalidated`,
  Fr: `Votre jeton d'accès à Google ou votre adresse électronique a été invalidée.`,
};
export const AUTH02 = {
  En: `Sorry, your have more than two session open. Consider closing one.`,
  Fr: `Désolé, vous avez plus de deux sessions ouvertes. Pensez à en fermer une.`,
};
export const AUTH03 = (message: string) => ({
  En: `Your login request failed with error: ${message}`,
  Fr: 'La demande de connexion a échoué avec une erreur :',
});
export const AUTH05 = {
  En: `Your API access are invalid`,
  Fr: `Vos accès d'API sont non valide`,
};
export const AUTH04 = {
  En: `Oops, you've recently triggered this action. Please try later`,
  Fr: 'Oups, vous avez récemment déclenché cette action. Veuillez essayer plus tard',
};
export const AUTH06 = (message: string) => ({
  En: `Log out error ${message}`,
  Fr: `Erreur de deconnexion ${message}`,
});
export const AUTH07 = {
  En: `Please, provide the right credentials`,
  Fr: `S'il vous plaît, fournissez les bonnes références`,
};
export const AUTH08 = {
  En: `Oops, you have an ongoing subscription. Try later`,
  Fr: 'Oups, vous avez un abonnement en cours. Essayez plus tard',
};
export const AUTH400 = {
  En: `Bad Request. Invalid grant`,
  Fr: 'Mauvaise demande. Subvention non valide',
};
export const AUTH401 = {
  En: `Incorrect email or password.`,
  Fr: 'Adresse mail ou mot de passe incorrect.',
};
export const AUTH404 = (search: string) => ({
  En: `"<${search}> not found.`,
  Fr: `<${search}> introuvable`,
});
export const sAUTH404 = {
  En: `Your reset password request cannot be found or has expired.`,
  Fr: `Votre demande de renouvellement de mot de passe est introuvable ou a expiré.`,
};

export const AUTH403 = (ressource: string) => ({
  En: `Access borbidden for ${ressource}.`,
  Fr: `Accès interdit pour ${ressource}`,
});
export const AUTH500 = {
  En: `Sorry, we could not destroy your session`,
  Fr: `Désolé, nous avons pas pu deruire votre session`,
};
export const AUTH501 = (element: string) => ({
  En: `Sorry, <${element}> is not yet implemented`,
  Fr: `Désolé, <${element}> n'est pas encore implémenté.`,
});
export const AUTH503 = {
  En: `Sorry, this action cannot be processed now. Consider trying later or with another account`,
  Fr: 'Désolé, cette action ne peut être traitée maintenant. Essayez plus tard ou avec un autre compte',
};

export const ERR01 = {
  En: `You most provide one and only one of the optional attributes`,
  Fr: `Vous ne pouvez fournir qu'un et qu'un seul des attributs facultatifs`,
};
export const ERR02 = {
  En: `Invalid school demand identifier`,
  Fr: `Identifiant de la demande non valide`,
};
export const ERR03 = (element: string) => ({
  En: `This element(${element}) already exits`,
  Fr: `Cette element(${element}) existe déjà`,
});
export const ERR04 = {
  En: `The number of classes in a specialty cannot differ from the number of years available in its curriculum.`,
  Fr: `Le nombre de classes dans une spécialité ne peut différer du nombre d'années disponibles dans son cursus.`,
};
