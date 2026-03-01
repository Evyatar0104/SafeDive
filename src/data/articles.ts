import futureTech from './articles/future-tech.json';
import humanBrain from './articles/human-brain.json';
import modernLifeHacks from './articles/modern-life-hacks.json';
import howItWorks from './articles/how-it-works.json';
import earthBeyond from './articles/earth-beyond.json';

export type Article = {
    id: string;
    category: string;
    title: string;
    header_image_prompt: string;
    image_url?: string;
    article_body: string;
    active_mission: {
        title: string;
        description: string;
        output_goal: string;
    };
    share_template: string;
};

export const allArticles: Article[] = [
    ...futureTech,
    ...humanBrain,
    ...modernLifeHacks,
    ...howItWorks,
    ...earthBeyond
];
