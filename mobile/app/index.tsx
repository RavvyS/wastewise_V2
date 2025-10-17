import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    ViewStyle,
    TextStyle
} from "react-native";
import * as Speech from "expo-speech";
import { Link, useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { getArticles, getQuizzes } from '../services/sqliteService';
import { calculateSpeechTime } from '../utils/readingTime';

// --- INLINE TYPE DEFINITIONS ---
// FIX: Changed id from number to string to match sqliteService
export interface Article {
    id: string; // Changed from number to string
    title: string;
    content: string;
    category?: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced' | string;
}

export interface Quiz {
    id: string; // Changed from number to string
    title: string;
}
// ------------------------------------------


// Define styles for clarity and type safety
interface IndexStyles {
    container: ViewStyle;
    header: ViewStyle;
    headerTitle: TextStyle;
    aiChatButton: ViewStyle;
    scrollContent: ViewStyle;
    loadingContainer: ViewStyle;
    loadingText: TextStyle;
    pageHeader: ViewStyle;
    pageTitle: TextStyle;
    pageSubtitle: TextStyle;
    tabContainer: ViewStyle;
    tab: ViewStyle;
    activeTab: ViewStyle;
    tabText: TextStyle;
    activeTabText: TextStyle;
    contentContainer: ViewStyle;
    sectionHeader: ViewStyle;
    addButton: ViewStyle;
    addButtonText: TextStyle;
    articleCard: ViewStyle;
    articleIconContainer: ViewStyle;
    articleContent: ViewStyle;
    articleTitle: TextStyle;
    articleDescription: TextStyle;
    articleMeta: ViewStyle;
    categoryBadge: ViewStyle;
    categoryText: TextStyle;
    levelBadge: ViewStyle;
    levelText: TextStyle;
    intermediateLevelBadge: ViewStyle;
    intermediateLevelText: TextStyle;
    advancedLevelBadge: ViewStyle;
    advancedLevelText: TextStyle;
    readTime: TextStyle;
    editIconButton: ViewStyle;
    emptyText: TextStyle;
    footerSpacer: ViewStyle;
}

const getLevelStyles = (level: string) => {
    switch (level) {
        case 'Intermediate':
            return {
                badgeStyle: styles.intermediateLevelBadge,
                textStyle: styles.intermediateLevelText
            };
        case 'Advanced':
            return {
                badgeStyle: styles.advancedLevelBadge,
                textStyle: styles.advancedLevelText
            };
        case 'Beginner':
        default:
            return {
                badgeStyle: styles.levelBadge,
                textStyle: styles.levelText
            };
    }
};

const ArticleCard = ({ item }: { item: Article }) => {
    const detailParams = {
        itemId: item.id,
        itemTitle: item.title,
    };

    const levelStyles = getLevelStyles(item.level);

    const readMinutes = calculateSpeechTime(item.content, 150);

    return (
        <Link
            href={{ pathname: '/ArticleDetail', params: detailParams as any }}
            asChild
        >
            <TouchableOpacity style={styles.articleCard}>
                <View style={styles.articleIconContainer}>
                    <Ionicons name="newspaper" size={32} color="#67A859" />
                </View>

                <View style={styles.articleContent}>
                    <Text style={styles.articleTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.articleDescription} numberOfLines={2}>
                        {item.content?.substring(0, 80) || 'Read this article...'}...
                    </Text>

                    <View style={styles.articleMeta}>
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>{item.category || 'N/A'}</Text>
                        </View>

                        <View style={[styles.levelBadge, levelStyles.badgeStyle]}>
                            <Text style={[styles.levelText, levelStyles.textStyle]}>
                                {item.level || 'N/A'}
                            </Text>
                        </View>

                        <Text style={styles.readTime}>
                            {readMinutes} min read
                        </Text>
                    </View>
                </View>

                <Link
                    href={{
                        pathname: "/edit/[id]",
                        params: { id: item.id, type: 'article' } // id is already string, no need to convert
                    } as any}
                    asChild
                >
                    <TouchableOpacity style={styles.editIconButton}>
                        <Ionicons name="create-outline" size={20} color="#757575" />
                    </TouchableOpacity>
                </Link>
            </TouchableOpacity>
        </Link>
    );
};

const QuizCard = ({ item }: { item: Quiz }) => {
    const detailParams = {
        itemId: item.id,
        itemTitle: item.title,
    };

    return (
        <Link
            href={{ pathname: '/QuizDetail', params: detailParams as any }}
            asChild
        >
            <TouchableOpacity style={styles.articleCard}>
                <View style={styles.articleIconContainer}>
                    <Ionicons name="help-circle" size={32} color="#67A859" />
                </View>

                <View style={styles.articleContent}>
                    <Text style={styles.articleTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.articleDescription} numberOfLines={2}>
                        Test your knowledge with this quiz
                    </Text>
                </View>

                <Link
                    href={{
                        pathname: "/edit/[id]",
                        params: { id: item.id, type: 'quiz' } // id is already string, no need to convert
                    } as any}
                    asChild
                >
                    <TouchableOpacity style={styles.editIconButton}>
                        <Ionicons name="create-outline" size={20} color="#757575" />
                    </TouchableOpacity>
                </Link>
            </TouchableOpacity>
        </Link>
    );
};

export default function Index() {
    const router = useRouter();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'articles' | 'quizzes'>('articles');

    const fetchData = async () => {
        setLoading(true);
        try {
            const articlesData = await getArticles();
            setArticles(articlesData);
            const quizzesData = await getQuizzes();
            setQuizzes(quizzesData);
        } catch (error) {
            console.error("Failed to fetch content from DB:", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Learning</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#67A859" />
                    <Text style={styles.loadingText}>Loading EcoZen Hub...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Learning</Text>

                {/* AI CHAT BUTTON */}
                <Link href={"/AIChat" as any} asChild>
                    <TouchableOpacity style={styles.aiChatButton}>
                        <Ionicons name="chatbubble-ellipses-outline" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </Link>
            </View>

            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Page Header */}
                <View style={styles.pageHeader}>
                    <Text style={styles.pageTitle}>Learning Hub</Text>
                    <Text style={styles.pageSubtitle}>Expand your knowledge</Text>
                </View>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'articles' && styles.activeTab]}
                        onPress={() => setActiveTab('articles')}
                    >
                        <Ionicons
                            name="book"
                            size={20}
                            color={activeTab === 'articles' ? '#67A859' : '#757575'}
                        />
                        <Text style={[styles.tabText, activeTab === 'articles' && styles.activeTabText]}>
                            Articles
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'quizzes' && styles.activeTab]}
                        onPress={() => setActiveTab('quizzes')}
                    >
                        <Ionicons
                            name="help-circle"
                            size={20}
                            color={activeTab === 'quizzes' ? '#67A859' : '#757575'}
                        />
                        <Text style={[styles.tabText, activeTab === 'quizzes' && styles.activeTabText]}>
                            Quizzes
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={styles.contentContainer}>
                    {activeTab === 'articles' ? (
                        <>
                            <View style={styles.sectionHeader}>
                                <Link href={{ pathname: '/create', params: { type: 'article' } }} asChild>
                                    <TouchableOpacity style={styles.addButton}>
                                        <Ionicons name="add" size={20} color="#fff" />
                                        <Text style={styles.addButtonText}>Add Article</Text>
                                    </TouchableOpacity>
                                </Link>
                            </View>

                            {articles.length === 0 ? (
                                <Text style={styles.emptyText}>No articles yet. Create one!</Text>
                            ) : (
                                articles.map((a) => <ArticleCard key={a.id} item={a} />)
                            )}
                        </>
                    ) : (
                        <>
                            <View style={styles.sectionHeader}>
                                <Link href={{ pathname: '/create', params: { type: 'quiz' } }} asChild>
                                    <TouchableOpacity style={styles.addButton}>
                                        <Ionicons name="add" size={20} color="#fff" />
                                        <Text style={styles.addButtonText}>Add Quiz</Text>
                                    </TouchableOpacity>
                                </Link>
                            </View>

                            {quizzes.length === 0 ? (
                                <Text style={styles.emptyText}>No quizzes yet. Create one!</Text>
                            ) : (
                                quizzes.map((q) => <QuizCard key={q.id} item={q} />)
                            )}
                        </>
                    )}
                </View>

                <View style={styles.footerSpacer} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create<IndexStyles>({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        backgroundColor: '#67A859',
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    aiChatButton: {
        padding: 8,
    },
    scrollContent: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#67A859',
        fontWeight: '500',
    },
    pageHeader: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 20,
    },
    pageTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2C2C2C',
        marginBottom: 8,
    },
    pageSubtitle: {
        fontSize: 16,
        color: '#757575',
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 20,
        gap: 12,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        gap: 8,
    },
    activeTab: {
        backgroundColor: '#E8F5E9',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#757575',
    },
    activeTabText: {
        color: '#67A859',
        fontWeight: '600',
    },
    contentContainer: {
        paddingHorizontal: 20,
    },
    sectionHeader: {
        marginBottom: 16,
        alignItems: 'flex-end',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#67A859',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 6,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    articleCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    articleIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    articleContent: {
        flex: 1,
    },
    articleTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2C2C2C',
        marginBottom: 8,
    },
    articleDescription: {
        fontSize: 14,
        color: '#757575',
        lineHeight: 20,
        marginBottom: 12,
    },
    articleMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    categoryBadge: {
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryText: {
        fontSize: 12,
        color: '#1976D2',
        fontWeight: '500',
    },

    // BEGINNER (DEFAULT/GREEN) STYLES
    levelBadge: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    levelText: {
        fontSize: 12,
        color: '#43A047',
        fontWeight: '500',
    },

    // INTERMEDIATE (YELLOW) STYLES
    intermediateLevelBadge: {
        backgroundColor: '#FFFDE7',
    },
    intermediateLevelText: {
        color: '#FFB300',
    },

    // ADVANCED (RED) STYLES
    advancedLevelBadge: {
        backgroundColor: '#FFEBEE',
    },
    advancedLevelText: {
        color: '#E53935',
    },

    readTime: {
        fontSize: 12,
        color: '#9E9E9E',
    },
    editIconButton: {
        padding: 8,
    },
    emptyText: {
        textAlign: 'center',
        color: '#9E9E9E',
        fontSize: 14,
        marginVertical: 40,
    },
    footerSpacer: {
        height: 40,
    },
});