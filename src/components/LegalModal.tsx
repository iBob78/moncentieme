import React, { useEffect, useState } from 'react';
import {
  X,
  Scale,
  ShieldCheck,
  FileText,
  Cookie,
  ServerCog,
  Copy,
  Check,
  Info,
  Lock,
  BadgeCheck,
  AlertTriangle,
  Globe,
} from 'lucide-react';

export type LegalTab = 'mentions' | 'confidentialite' | 'cgu' | 'cookies' | 'confiance';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalTab;
}

/** Placeholder à personnaliser avant mise en ligne */
const PH: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[11px] whitespace-nowrap">
    {children}
  </span>
);

const CodeBlock: React.FC<{ title: string; code: string }> = ({ title, code }) => {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-black/60 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900/80 border-b border-slate-800">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">{title}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copié</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copier</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 text-[11px] leading-relaxed font-mono text-emerald-300 overflow-x-auto">{code}</pre>
    </div>
  );
};

const SectionTitle: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
  <h3 className="flex items-center gap-2 text-sm font-bold text-white mb-2 mt-5 first:mt-0">{icon}{children}</h3>
);

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, initialTab = 'mentions' }) => {
  const [tab, setTab] = useState<LegalTab>(initialTab);

  useEffect(() => {
    if (isOpen) setTab(initialTab);
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const tabs: { id: LegalTab; label: string; icon: React.ReactNode }[] = [
    { id: 'mentions', label: 'Mentions légales', icon: <Scale className="w-3.5 h-3.5" /> },
    { id: 'confidentialite', label: 'Confidentialité', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'cgu', label: "Conditions d'utilisation", icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'cookies', label: 'Cookies & traceurs', icon: <Cookie className="w-3.5 h-3.5" /> },
    { id: 'confiance', label: 'Confiance technique', icon: <ServerCog className="w-3.5 h-3.5" /> },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="modal-pop relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl text-slate-200 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Mentions légales et conformité"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <BadgeCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                Conformité, mentions & confiance
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                « Mon centième » — site vitrine d'horlogerie décimale, sans collecte de données
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 sm:px-6 pt-3 pb-2 border-b border-slate-800 overflow-x-auto shrink-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                tab === t.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 text-[13px] leading-relaxed">
          
          {/* ---------------- MENTIONS LÉGALES ---------------- */}
          {tab === 'mentions' && (
            <div className="space-y-1">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  Avant toute mise en ligne publique, remplacez les champs encadrés en orange par vos
                  informations réelles : la loi pour la confiance dans l'économie numérique (LCEN, art. 6-III)
                  rend ces mentions <strong>obligatoires</strong> pour tout site publié en France.
                </p>
              </div>

              <SectionTitle icon={<Scale className="w-4 h-4 text-emerald-400" />}>
                1. Éditeur du site
              </SectionTitle>
              <ul className="space-y-1.5 text-slate-300">
                <li>• Nom / raison sociale : <PH>Votre nom ou société</PH></li>
                <li>• Forme juridique & capital : <PH>SARL / auto-entreprise…</PH></li>
                <li>• Adresse : <PH>Votre adresse postale</PH></li>
                <li>• Contact : <PH>contact@votre-domaine.fr</PH> — Tél : <PH>0X XX XX XX XX</PH></li>
                <li>• Directeur de la publication : <PH>Votre nom</PH></li>
                <li>• SIRET / RCS : <PH>XXX XXX XXX XXXXX</PH></li>
              </ul>

              <SectionTitle icon={<ServerCog className="w-4 h-4 text-emerald-400" />}>
                2. Hébergement
              </SectionTitle>
              <ul className="space-y-1.5 text-slate-300">
                <li>• Hébergeur : <PH>Nom de l'hébergeur</PH></li>
                <li>• Adresse : <PH>Adresse de l'hébergeur</PH></li>
                <li>• Tél : <PH>Téléphone de l'hébergeur</PH></li>
              </ul>

              <SectionTitle icon={<Lock className="w-4 h-4 text-emerald-400" />}>
                3. Propriété intellectuelle
              </SectionTitle>
              <p className="text-slate-300">
                L'ensemble des éléments de ce site (interface, cadrans d'horloge, textes, barèmes de
                conversion, code source) est protégé par le droit d'auteur. Toute reproduction ou
                réutilisation sans autorisation écrite préalable de l'éditeur est interdite, à l'exception
                des copies privées et des courtes citations.
              </p>

              <SectionTitle icon={<Info className="w-4 h-4 text-emerald-400" />}>
                4. Responsabilité
              </SectionTitle>
              <p className="text-slate-300">
                Les conversions affichées (base 60 ⇄ base 100) sont fournies à titre informatif. Bien que
                calculées avec le plus grand soin, elles ne constituent pas un conseil juridique ou
                comptable : vérifiez toujours vos saisies auprès de votre logiciel de paie officiel.
                L'éditeur ne saurait être tenu responsable d'une erreur de saisie ou d'interprétation.
              </p>

              <SectionTitle icon={<Globe className="w-4 h-4 text-emerald-400" />}>
                5. Médiation & droit applicable
              </SectionTitle>
              <p className="text-slate-300">
                Tout litige relatif à l'utilisation du site est soumis au droit français. Conformément
                aux articles L.616-1 et R.616-1 du code de la consommation, l'utilisateur consommateur peut
                recourir gratuitement à un médiateur de la consommation : <PH>médiateur compétent</PH>.
              </p>
            </div>
          )}

          {/* ---------------- CONFIDENTIALITÉ ---------------- */}
          {tab === 'confidentialite' && (
            <div className="space-y-1">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 mb-4">
                <p className="text-emerald-200 text-sm font-bold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  Aucune donnée personnelle n'est collectée, ni transmise, ni stockée.
                </p>
                <p className="text-emerald-100/80 text-xs mt-1">
                  Tous les calculs d'horloge et de conversion sont effectués localement, dans votre
                  navigateur. Rien ne part sur un serveur : il n'existe ni compte, ni formulaire, ni
                  statistique de fréquentation.
                </p>
              </div>

              <SectionTitle icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}>
                1. Responsable de traitement
              </SectionTitle>
              <p className="text-slate-300">
                <PH>Votre nom ou société</PH> — <PH>contact@votre-domaine.fr</PH>.
                Dans les faits, aucun traitement de données à caractère personnel n'est mis en œuvre :
                le site n'est donc pas soumis à obligation de registre RGPD.
              </p>

              <SectionTitle icon={<Lock className="w-4 h-4 text-emerald-400" />}>
                2. Données traitées : néant
              </SectionTitle>
              <ul className="space-y-1.5 text-slate-300">
                <li>• Pas de compte utilisateur, pas d'inscription, pas de formulaire de contact collectant.</li>
                <li>• Pas de cookies, pas de traceurs, pas de mesure d'audience, pas de publicité.</li>
                <li>• Pas de stockage local (localStorage / indexedDB) : fermez l'onglet, tout est oublié.</li>
                <li>• Les heures saisies (cumul, pointage) restent en mémoire vive du navigateur uniquement.</li>
              </ul>

              <SectionTitle icon={<Globe className="w-4 h-4 text-emerald-400" />}>
                3. Seul service tiers : polices d'écriture
              </SectionTitle>
              <p className="text-slate-300">
                Les typographies sont servies par Google Fonts. Lors du chargement, votre adresse IP est
                techniquement visible par ce service. Pour un niveau de confidentialité maximal, vous
                pouvez auto-héberger les polices (fichiers WOFF2 dans le projet) et supprimer tout appel
                externe : le site fonctionne alors en circuit totalement fermé.
              </p>

              <SectionTitle icon={<Info className="w-4 h-4 text-emerald-400" />}>
                4. Vos droits (RGPD)
              </SectionTitle>
              <p className="text-slate-300">
                Aucune donnée n'étant conservée, les droits d'accès, de rectification, d'effacement, de
                limitation, de portabilité et d'opposition sont sans objet. Pour toute question relative
                à la vie privée : <PH>contact@votre-domaine.fr</PH>. Réponse sous 30 jours.
              </p>

              <SectionTitle icon={<BadgeCheck className="w-4 h-4 text-emerald-400" />}>
                5. CNIL
              </SectionTitle>
              <p className="text-slate-300">
                Le site étant exempt de cookies et de collecte, il entre dans le cadre d'exemption de
                déclaration auprès de la CNIL. Un bandeau cookies n'est donc pas requis (délibération
                CNIL n° 2020-091).
              </p>
            </div>
          )}

          {/* ---------------- CGU ---------------- */}
          {tab === 'cgu' && (
            <div className="space-y-1">
              <SectionTitle icon={<FileText className="w-4 h-4 text-emerald-400" />}>
                1. Objet
              </SectionTitle>
              <p className="text-slate-300">
                Les présentes conditions régissent l'utilisation du site « Mon centième », outil de
                visualisation et de conversion d'heures entre le système sexagésimal (base 60) et le
                système centésimal / industriel (base 100), ainsi que de cumul de pointage.
              </p>

              <SectionTitle icon={<BadgeCheck className="w-4 h-4 text-emerald-400" />}>
                2. Accès & gratuité
              </SectionTitle>
              <p className="text-slate-300">
                Le site est accessible gratuitement, sans inscription, depuis tout navigateur moderne
                disposant d'une connexion sécurisée (HTTPS). L'éditeur s'efforce d'assurer une
                disponibilité continue mais ne garantit aucune absence d'interruption.
              </p>

              <SectionTitle icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}>
                3. Usage conforme
              </SectionTitle>
              <p className="text-slate-300">
                L'utilisateur s'engage à utiliser l'outil de bonne foi, à des fins licites, et à ne pas
                tenter d'altérer, désassembler ou surcharger le service. Les résultats de conversion
                restent sous sa responsabilité pour tout usage déclaratif (paie, facturation).
              </p>

              <SectionTitle icon={<Info className="w-4 h-4 text-emerald-400" />}>
                4. Évolution & droit applicable
              </SectionTitle>
              <p className="text-slate-300">
                L'éditeur peut faire évoluer le site et les présentes conditions à tout moment ; la
                version en ligne fait foi. Droit français applicable, tribunaux compétents :
                <PH>Votre juridiction</PH>.
              </p>
            </div>
          )}

          {/* ---------------- COOKIES ---------------- */}
          {tab === 'cookies' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                <Cookie className="w-6 h-6 text-emerald-400 shrink-0" />
                <p className="text-emerald-200 text-sm font-bold">
                  Ce site ne dépose aucun cookie, aucun traceur, aucun stockage local.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 uppercase tracking-wider">
                      <th className="text-left px-4 py-2.5 font-bold">Type de stockage</th>
                      <th className="text-left px-4 py-2.5 font-bold">Utilisé ?</th>
                      <th className="text-left px-4 py-2.5 font-bold">Finalité</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300">
                    <tr className="border-t border-slate-800">
                      <td className="px-4 py-2.5 font-semibold">Cookies session / persistants</td>
                      <td className="px-4 py-2.5"><span className="text-emerald-400 font-bold">Non</span></td>
                      <td className="px-4 py-2.5">—</td>
                    </tr>
                    <tr className="border-t border-slate-800 bg-slate-950/40">
                      <td className="px-4 py-2.5 font-semibold">Mesure d'audience (analytics)</td>
                      <td className="px-4 py-2.5"><span className="text-emerald-400 font-bold">Non</span></td>
                      <td className="px-4 py-2.5">—</td>
                    </tr>
                    <tr className="border-t border-slate-800">
                      <td className="px-4 py-2.5 font-semibold">Publicité / réseaux sociaux</td>
                      <td className="px-4 py-2.5"><span className="text-emerald-400 font-bold">Non</span></td>
                      <td className="px-4 py-2.5">—</td>
                    </tr>
                    <tr className="border-t border-slate-800 bg-slate-950/40">
                      <td className="px-4 py-2.5 font-semibold">localStorage / indexedDB</td>
                      <td className="px-4 py-2.5"><span className="text-emerald-400 font-bold">Non</span></td>
                      <td className="px-4 py-2.5">—</td>
                    </tr>
                    <tr className="border-t border-slate-800">
                      <td className="px-4 py-2.5 font-semibold">Fingerprinting</td>
                      <td className="px-4 py-2.5"><span className="text-emerald-400 font-bold">Non</span></td>
                      <td className="px-4 py-2.5">—</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-slate-400 text-xs">
                Conséquence pratique : aucun bandeau de consentement n'est requis, et les politiques de
                filtrage « anti-traceurs » des proxy d'entreprise (Zscaler, Netskope, FortiGate…) n'ont
                aucun motif de signaler la page.
              </p>
            </div>
          )}

          {/* ---------------- CONFIANCE TECHNIQUE ---------------- */}
          {tab === 'confiance' && (
            <div className="space-y-4">
              <p className="text-slate-300">
                Les proxy d'entreprise, firewalls et filtres de réputation jugent un site sur des signaux
                concrets. Voici ce qui est <strong className="text-emerald-300">déjà en place</strong> sur
                « Mon centième », puis ce qui relève de <strong className="text-sky-300">votre hébergement</strong>.
              </p>

              {/* Déjà en place */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2 mb-3">
                  <BadgeCheck className="w-4 h-4" /> Déjà intégré au site
                </h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /> Mentions légales, politique de confidentialité, CGU et page cookies accessibles depuis le pied de page.</li>
                  <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /> Zéro cookie, zéro tracker, zéro script publicitaire ou d'analytique : aucun motif de blocage « privacy ».</li>
                  <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /> Fichier <code className="font-mono text-emerald-300">robots.txt</code> déclaré (transparence envers les crawlers de réputation).</li>
                  <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /> Fichier <code className="font-mono text-emerald-300">.well-known/security.txt</code> (RFC 9116) : contact sécurité déclaré, signe de sérieux reconnu.</li>
                  <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /> Métadonnées complètes et honnêtes (description, langue, Open Graph, données structurées Schema.org) : les passerelles de sécurité lisent un site cohérent, pas une page anonyme.</li>
                  <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /> Politique de référant restrictive (<code className="font-mono text-emerald-300">strict-origin-when-cross-origin</code>) déclarée en meta.</li>
                  <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /> Code lisible, sans obfuscation, sans <code className="font-mono text-emerald-300">eval()</code>, sans iframe cachée, sans redirection trompeuse : les moteurs anti-malware n'y trouvent rien à signaler.</li>
                  <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /> Application monopage légère, sans téléchargement furtif ni demande de permission (caméra, micro, géolocalisation : jamais).</li>
                </ul>
              </div>

              {/* À faire côté hébergement */}
              <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-4">
                <h3 className="text-sm font-bold text-sky-300 flex items-center gap-2 mb-3">
                  <ServerCog className="w-4 h-4" /> À activer chez votre hébergeur (indispensable)
                </h3>
                <ul className="space-y-2 text-xs text-slate-300 mb-4">
                  <li className="flex gap-2"><span className="text-sky-400 font-bold shrink-0">1.</span> <strong>HTTPS obligatoire</strong> avec certificat valide (Let's Encrypt) : premier critère de confiance des proxy. Activez HSTS pour figurer à terme sur les preload lists.</li>
                  <li className="flex gap-2"><span className="text-sky-400 font-bold shrink-0">2.</span> En-têtes de sécurité ci-dessous (copiez-collez selon votre serveur).</li>
                  <li className="flex gap-2"><span className="text-sky-400 font-bold shrink-0">3.</span> Nom de domaine propre, WHOIS cohérent avec vos mentions légales, DNSSEC si disponible.</li>
                  <li className="flex gap-2"><span className="text-sky-400 font-bold shrink-0">4.</span> Vérifiez la réputation de votre URL après mise en ligne : Google Safe Browsing (Search Console), VirusTotal, URLhaus. Un domaine neuf peut mettre 24-48 h à être « blanc » partout.</li>
                  <li className="flex gap-2"><span className="text-sky-400 font-bold shrink-0">5.</span> Remplacez les champs orange des mentions légales : un site anonyme est le premier motif de blocage en entreprise.</li>
                </ul>

                <div className="space-y-3">
                  <CodeBlock
                    title="nginx"
                    code={`add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()" always;`}
                  />
                  <CodeBlock
                    title="Apache (.htaccess)"
                    code={`Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "DENY"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()"`}
                  />
                  <CodeBlock
                    title="Fichier _headers (Netlify & compatibles)"
                    code={`/*
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`}
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                Avec HTTPS + en-têtes + mentions complètes + absence totale de traceurs, le site présente
                un dossier « patte blanche » complet vis-à-vis des proxy, firewalls et filtres de
                réputation les plus stricts.
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-slate-500">
            Dernière mise à jour des mentions : <PH>JJ/MM/AAAA</PH>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
