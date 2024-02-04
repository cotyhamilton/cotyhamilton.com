export type NavigationItem = {
	icon: string;
	link: string;
	sub?: NavigationItem[];
};

export type Settings = {
	title: string;
	icon: string;
	navigation: NavigationItem[];
};
